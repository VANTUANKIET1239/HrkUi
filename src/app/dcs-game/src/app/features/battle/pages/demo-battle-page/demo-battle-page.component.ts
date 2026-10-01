import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { BattleLabApiService } from '../../../../core/services/battle-lab-api.service';
import { BattleEngineService } from '../../../../core/services/battle-engine.service';
import { LabReport, LabRequest, LabSlot, LabItemOption } from '../../../../core/models/battle-lab.model';
import { createBalanceAnalysis } from '../../../../core/models/battle-lab-analysis';
import { LAB_CONFIG_MAX_BYTES, parseLabConfig, serializeLabConfig } from '../../../../core/models/battle-lab-config';
import { HeroStatsDto, PlayerHeroDto } from '../../../../core/models/player-hero.model';
import { StartBattleResultDto } from '../../../../core/models/battle.model';
import { BattleSceneComponent } from '../../components/battle-scene/battle-scene.component';

@Component({
  selector: 'app-demo-battle-page', standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BattleSceneComponent],
  templateUrl: './demo-battle-page.component.html', styleUrl: './demo-battle-page.component.scss'
})
export class DemoBattlePageComponent implements OnInit, OnDestroy {
  private readonly api = inject(BattleLabApiService);
  private readonly destroyRef = inject(DestroyRef);
  readonly engine = inject(BattleEngineService);
  heroes: PlayerHeroDto[] = [];
  equipment: LabItemOption[] = [];
  settings: LabRequest = { left: [], right: [], seed: 1, count: 100, maxRounds: 50, defenseConstant: 1000 };
  report?: LabReport;
  baseline?: { wins: number; rounds: number; count: number; k: number };
  battle?: StartBattleResultDto;
  loading = true;
  running = false;
  error = '';
  notice = '';
  importing = false;
  pendingConfig?: LabRequest;
  configFileName = '';
  readonly fields: { key: keyof HeroStatsDto; label: string; min: number; max: number }[] = [
    { key: 'hp', label: 'HP', min: 1, max: 1000000 },
    { key: 'atk', label: 'ATK', min: 0, max: 100000 },
    { key: 'def', label: 'DEF', min: 0, max: 100000 },
    { key: 'spd', label: 'SPD', min: 1, max: 10000 },
    { key: 'magicDamage', label: 'Sát thương phép', min: 0, max: 100000 },
    { key: 'magicResistance', label: 'Kháng phép', min: 0, max: 100000 },
    { key: 'crit', label: 'Bạo kích %', min: 0, max: 1000 },
    { key: 'critDmg', label: 'ST bạo kích %', min: 0, max: 1000 }
  ];

  ngOnInit(): void {
    this.api.catalog().pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading = false)).subscribe({
      next: r => {
        if (!r.success || !r.data) { this.error = r.message || 'Không tải được danh mục.'; return; }
        this.heroes = r.data.heroes;
        this.equipment = r.data.equipment ?? [];
        this.settings.defenseConstant = r.data.defenseConstant;
        this.add(this.settings.left);
        this.add(this.settings.right);
      },
      error: e => this.error = e?.status === 404
        ? 'Battle Lab chỉ mở trong Development, hoặc khi bật BattleLab:Enabled và tài khoản có role Admin.'
        : (e?.error?.message || e?.message || 'Không kết nối được Battle Lab.')
    });
  }

  add(team: LabSlot[]): void {
    if (!this.heroes.length || team.length >= 5) return;
    const position = [1, 2, 3, 4, 5].find(p => !team.some(s => s.position === p))!;
    team.push({ heroTemplateId: this.heroes[0].heroTemplateId ?? this.heroes[0].id, position,
      stats: structuredClone(this.heroes[0].stats) });
  }
  selectHero(slot: LabSlot): void {
    const hero = this.heroes.find(h => h.heroTemplateId === slot.heroTemplateId);
    if (hero && slot.mode !== 'BUILD') slot.stats = structuredClone(hero.stats);
  }
  changeMode(slot: LabSlot, mode: 'BUILD' | 'CUSTOM'): void {
    slot.mode = mode;
    if (mode === 'BUILD') {
      delete slot.stats;
      slot.build = { level: 1, stars: 1, auraTier: 1, rollSeed: 1, equipment: [] };
    } else {
      delete slot.build;
      this.selectHero(slot);
    }
  }
  addEquipment(slot: LabSlot): void {
    if (slot.build && slot.build.equipment.length < 6 && this.equipment.length)
      slot.build.equipment.push({ itemTemplateId: this.equipment[0].id, enhancement: 0, stars: 0 });
  }
  remove(team: LabSlot[], index: number): void { team.splice(index, 1); }
  mirror(): void { this.settings.right = structuredClone(this.settings.left); }
  presetDefense(value: number): void {
    this.settings.right.forEach(s => { if (s.stats) { s.stats.def = value; s.stats.magicResistance = value; } });
    this.notice = 'Preset DEF/MR chỉ áp dụng cho tướng ở chế độ Chỉ số tùy chỉnh.';
  }
  run(single: boolean): void {
    if (this.running) return;
    this.error = ''; this.notice = ''; this.running = true;
    let request: LabRequest;
    try { request = parseLabConfig(JSON.stringify(this.settings), this.heroes); }
    catch (e) { this.running = false; this.error = e instanceof Error ? e.message : 'Config không hợp lệ.'; return; }
    if (single) request.count = 1;
    this.api.run(request).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.running = false)).subscribe({
      next: r => {
        if (!r.success || !r.data) { this.error = r.message || 'Mô phỏng thất bại.'; return; }
        this.report = r.data;
        if (single && r.data.replays[0]) this.play(r.data.replays[0]);
      },
      error: e => this.error = e?.error?.message || e?.message || 'Mô phỏng thất bại.'
    });
  }
  play(battle: StartBattleResultDto): void {
    this.engine.resetBattle(); this.battle = battle;
    this.engine.loadServerBattle(battle); this.engine.startBattle();
  }
  closeReplay(): void { this.engine.resetBattle(); this.battle = undefined; }
  get wins(): number { return this.report?.runs.filter(r => r.winner === 'LEFT').length || 0; }
  get averageRounds(): number {
    return this.report?.runs.length ? this.report.runs.reduce((sum, r) => sum + r.rounds, 0) / this.report.runs.length : 0;
  }
  pinBaseline(): void {
    if (this.report) this.baseline = { wins: this.wins, rounds: this.averageRounds,
      count: this.report.runs.length, k: this.report.settings.defenseConstant };
  }
  save(): void {
    try { localStorage.setItem('hrk-battle-lab-v1', JSON.stringify(this.settings)); this.notice = 'Đã lưu preset trên trình duyệt này.'; }
    catch { this.error = 'Trình duyệt không cho phép lưu preset.'; }
  }
  load(): void {
    try {
      const text = localStorage.getItem('hrk-battle-lab-v1');
      if (!text) { this.notice = 'Chưa có preset đã lưu.'; return; }
      this.applyConfig(parseLabConfig(text, this.heroes));
      this.notice = 'Đã nạp preset; kỹ năng sẽ lấy từ DB hiện tại khi chạy.';
    } catch (e) { this.error = e instanceof Error ? e.message : 'Preset không hợp lệ.'; }
  }
  async importConfig(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || this.running || this.importing) return;
    this.pendingConfig = undefined; this.configFileName = ''; this.error = ''; this.notice = '';
    if (file.size > LAB_CONFIG_MAX_BYTES) { this.error = 'File config tối đa 64 KB. Hãy dùng file config, không dùng báo cáo replay.'; return; }
    this.importing = true;
    try {
      const text = await file.text();
      if (this.destroyRef.destroyed) return;
      this.pendingConfig = parseLabConfig(text, this.heroes);
      this.configFileName = file.name;
    } catch (e) { if (!this.destroyRef.destroyed) this.error = e instanceof Error ? e.message : 'Không đọc được file JSON.'; }
    finally { this.importing = false; }
  }
  applyImportedConfig(): void {
    if (!this.pendingConfig || this.running) return;
    this.applyConfig(this.pendingConfig);
    this.pendingConfig = undefined;
    this.notice = 'Đã áp dụng ' + this.configFileName + '. Chưa chạy mô phỏng và không thay đổi DB.';
  }
  private applyConfig(config: LabRequest): void {
    this.settings = structuredClone(config);
    this.report = undefined; this.baseline = undefined; this.error = '';
  }
  exportConfig(): void {
    try {
      const settings = parseLabConfig(JSON.stringify(this.settings), this.heroes);
      this.download(serializeLabConfig(settings), 'battle-lab-config.json');
    } catch (e) { this.error = e instanceof Error ? e.message : 'Config chưa hợp lệ.'; }
  }
  private download(content: string, name: string): void {
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  exportReport(): void {
    if (!this.report) return;
    this.download(JSON.stringify(this.report), 'battle-lab-' + this.report.settings.seed + '.json');
  }
  exportAnalysis(): void {
    if (this.report) this.download(JSON.stringify(createBalanceAnalysis(this.report), null, 2),
      'battle-balance-analysis-' + this.report.settings.seed + '.json');
  }
  ngOnDestroy(): void { if (this.battle) this.engine.resetBattle(); }
}
