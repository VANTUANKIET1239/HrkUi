import { HrkTranslatePipe } from '@hrk/localization/hrk-translate.pipe';
import { HrkImageDirective } from '../../../../../../../../libs/shared/ui/controls/hrk-image/hrk-image.directive';
import { HrkConfirmationModalComponent } from '../../../../../../../../libs/shared/ui/modal/hrk-confirmation-modal.component';
import { GameToastService } from '../../../../core/services/game-toast.service';
import { GameTemplateCacheService } from '../../../../core/services/game-template-cache.service';
import { GameModalConfigService } from '../../../../core/services/game-modal-config.service';
import { HrkConfirmationService } from '../../../../../../../../libs/shared/ui/modal/hrk-confirmation.service';
import { DestroyRef, Component, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { reportAppWarning } from '../../../../../../../../libs/core/http/hrk-api/app-error';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HeroManagementComponent } from '../../components/hero-management/hero-management.component';
import { FormationManagementComponent } from '../../components/formation-management/formation-management.component';
import { InventoryComponent } from '../../components/inventory/inventory.component';
import { ForgeComponent } from '../../components/forge/forge.component';
import { LibraryComponent } from '../../components/library/library.component';
import { PlayerLevelBadgeComponent } from '../../components/player-level-badge/player-level-badge.component';
import { AvatarSelectorComponent } from '../../components/avatar-selector/avatar-selector.component';
import { GameSettingsComponent } from '../../components/game-settings/game-settings.component';
import { BaseResponse, PlayerProfileDto } from '../../../../core/models/player.model';
import { FormationService } from '../../../../core/services/formation.service';
import { FormationDetailDto } from '../../../../core/models/formation.model';

interface PlayerInfo {
  name: string;
  level: number;
  exp: number;
  maxExp: number;
  vip: number;
  power: number;
  stamina: number;
  maxStamina: number;
  gold: string;
  diamond: string;
  avatarUrl: string;
}

export interface TeamMember {
  id?: number;
  slot?: number;
  name: string;
  level: number;
  stars?: number;
  power?: number;
  rarityCode?: string;
  title?: string;
  color: string;
  role: string;
  avatar?: string;
  isEmpty?: boolean;
}

interface FeatureItem {
  name: string;
  icon?: string;
  hasNotification: boolean;
  locked?: boolean;
  code?: string;
  actionCode?: string;
  placement?: string;
  children?: FeatureItem[];
}

import { TokenManagerService } from '../../../../../../../../libs/core/auth/services/token-manager';
import { ProcessRealtimeService } from '../../../../core/services/process-realtime.service';
import { HrkApiService } from '../../../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { ApiMethod } from '../../../../../../../../libs/shared/common/constants/ApiMethod.constants';
import { ApiEndpoints } from '../../../../../../../../libs/shared/common/constants/api-endpoints';
import { PlayerService } from '../../../../core/services/player.service';
import { GameHomeInitializationService, GameHomeInitialData } from '../../services/game-home-initialization.service';
import { GameFeatureConfigService } from '../../../../core/services/game-feature-config.service';
import { GameFeatureConfig } from '../../../../core/models/game-feature-config.model';
import { DungeonApiService } from '../../../../core/services/dungeon-api.service';

@Component({
  selector: 'app-game-home',
  standalone: true,
  imports: [HrkTranslatePipe, HrkImageDirective, HrkConfirmationModalComponent, CommonModule, HeroManagementComponent, FormationManagementComponent, InventoryComponent, ForgeComponent, LibraryComponent, PlayerLevelBadgeComponent, AvatarSelectorComponent, GameSettingsComponent],
  templateUrl: './game-home.component.html',
  styleUrl: './game-home.component.scss'
})
export class GameHomeComponent implements OnInit {
  private readonly toast = inject(GameToastService);
  private readonly templateCache = inject(GameTemplateCacheService);
  private readonly modalConfigs = inject(GameModalConfigService);
  private readonly confirmations = inject(HrkConfirmationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formationService = inject(FormationService, { optional: true });

  canRefreshTemplates = false;
  isRefreshingTemplates = false;

  isHeroManagementOpen = false;
  isFormationManagementOpen = false;
  isInventoryOpen = false;
  isForgeOpen = false;
  isLibraryOpen = false;
  isAvatarSelectorOpen = false;
  isSettingsOpen = false;
  playerProfile?: PlayerProfileDto;
  selectedFormationCode = '';
  selectedFormationName = 'Đội Hình Chiến Thuật';
  private rawGold = 0;

  playerInfo: PlayerInfo = {
    name: 'Người chơi',
    level: 1,
    exp: 0,
    maxExp: 1000,
    vip: 0,
    power: 0,
    stamina: 0,
    maxStamina: 100,
    gold: '0',
    diamond: '0',
    avatarUrl: ''
  };

  private readonly defaultSquad: TeamMember[] = [
    { slot: 1, name: 'Hoàng Nguyên Gymer', level: 15, stars: 3, rarityCode: 'EPIC', color: '#38bdf8', role: 'Đỡ đòn / Tiên phong', avatar: '/assets/images/dcs-game/heroes/hoang-nguyen-gymer.png' },
    { slot: 2, name: 'Nghĩa Phúc Prime', level: 20, stars: 4, rarityCode: 'LEGENDARY', color: '#bcf27b', role: 'Đấu sĩ chủ lực', avatar: '/assets/images/dcs-game/heroes/nghia-phuc-prime.png' },
    { slot: 3, name: 'Quốc Nhân Chạy Ngay Đi', level: 18, stars: 3, rarityCode: 'EPIC', color: '#fbbf24', role: 'Tốc kích / Sát thủ', avatar: '/assets/images/dcs-game/heroes/quoc-nhan-chay-ngay-di.png' },
    { slot: 4, name: 'Siba Thiên Thần', level: 22, stars: 5, rarityCode: 'MYTHIC', color: '#f43f5e', role: 'Pháp sư / Hỏa lực', avatar: '/assets/images/dcs-game/heroes/siba-thien-than-mythic.png' },
    { slot: 5, name: 'Kiệt Bác Sĩ', level: 16, stars: 3, rarityCode: 'EPIC', color: '#c084fc', role: 'Hỗ trợ / Hồi phục', avatar: '/assets/images/dcs-game/heroes/kiet-bac-si-epic.png' }
  ];

  mainTeam: TeamMember[] = [...this.defaultSquad];

  topEvents: FeatureItem[] = [];
  bottomFeaturesLeft: FeatureItem[] = [];
  bottomFeaturesRight: FeatureItem[] = [];

  showMoreMenu = false;
  focusFeature?: FeatureItem;
  isLogoutConfirmOpen = false;
  isLoggingOut = false;
  logoutError = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tokenManager: TokenManagerService,
    private hrkApiService: HrkApiService,
    private playerService: PlayerService,
    private gameHomeInitService: GameHomeInitializationService,
    private gameFeatureConfigService: GameFeatureConfigService,
    private dungeonApiService: DungeonApiService,
    private processRealtimeService: ProcessRealtimeService
  ) { }

  ngOnInit(): void {
    this.templateCache.capabilities().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => this.canRefreshTemplates = response.data?.canRefresh === true,
      error: () => this.canRefreshTemplates = false
    });
    const resolvedData = this.route.snapshot.data['homeData'] as GameHomeInitialData | undefined;
    if (resolvedData) {
      this.applyHomeData(resolvedData);
    } else {
      this.gameHomeInitService.loadHomeData().subscribe((data) => {
        this.applyHomeData(data);
      });
    }
    this.loadFeatureConfigs();
    this.dungeonApiService.stamina().subscribe(response => {
      if (response.success && response.data) {
        this.playerInfo.stamina = response.data.current;
        this.playerInfo.maxStamina = response.data.max;
      }
    });
  }

  async refreshTemplates(): Promise<void> {
    if (!this.canRefreshTemplates || this.isRefreshingTemplates) return;
    this.isRefreshingTemplates = true;
    const confirmed = await this.confirmations.confirm('TEMPLATE_CACHE_REFRESH', {
      kind: 'CONFIRMATION', title: 'Đồng bộ template', tone: 'WARNING', iconKey: 'warning',
      messageTemplate: 'Nạp lại template từ database? Các thao tác mới sẽ sử dụng dữ liệu vừa đồng bộ.',
      confirmText: 'Đồng bộ', cancelText: 'Hủy'
    });
    if (!confirmed || this.destroyRef.destroyed) {
      this.isRefreshingTemplates = false;
      return;
    }
    this.templateCache.refresh().pipe(
      takeUntilDestroyed(this.destroyRef), finalize(() => this.isRefreshingTemplates = false)
    ).subscribe({
      next: response => {
        if (!response.success || !response.data) return;
        this.loadFeatureConfigs();
        this.modalConfigs.load(true);
        this.refreshPower();
        this.toast.success(this.toast.text`Đã đồng bộ ${response.data.tableCount} bảng template (${response.data.rowCount} dòng).`);
      },
      error: error => this.toast.fromError(error, 'Không thể đồng bộ template. Vui lòng thử lại.')
    });
  }

  private loadFeatureConfigs(): void {
    this.gameFeatureConfigService.getFeatures().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        if (!response?.success || !response.data) return;
        const toFeature = (item: GameFeatureConfig): FeatureItem => ({
          name: item.name, icon: item.icon, hasNotification: item.hasNotification,
          locked: item.isLocked, code: item.code, actionCode: item.actionCode,
          placement: item.placement, children: item.children?.map(toFeature) ?? []
        });
        const features = response.data.map(toFeature);
        this.topEvents = features.filter(x => x.placement === 'TOP_EVENT');
        this.bottomFeaturesLeft = features.filter(x => x.placement === 'BOTTOM_LEFT');
        this.bottomFeaturesRight = features.filter(x => x.placement === 'BOTTOM_RIGHT');
        this.focusFeature = features.find(x => x.placement === 'BOTTOM_FOCUS');
      },
      error: error => reportAppWarning('Could not load game feature configuration.', error)
    });
  }

  private applyHomeData(data: GameHomeInitialData): void {
    if (data.profile) {
      this.playerProfile = data.profile;
      this.playerInfo.avatarUrl = this.playerService.resolveAvatarUrl(data.profile);
      if (data.profile.playerName) {
        this.playerInfo.name = data.profile.playerName;
      }
      if (data.profile.level) {
        this.playerInfo.level = data.profile.level;
      }
      this.playerInfo.exp = data.profile.exp ?? 0;
      this.playerInfo.maxExp = Math.max(1, data.profile.maxExp ?? 1000);
      if (data.profile.power !== undefined && data.profile.power !== null) {
        this.playerInfo.power = data.profile.power;
      }
    }

    if (data.formationPower !== undefined && data.formationPower !== null) {
      this.playerInfo.power = data.formationPower;
    }

    if (data.selectedFormationName) {
      this.selectedFormationName = data.selectedFormationName;
    }

    if (data.selectedFormationCode) {
      this.selectedFormationCode = data.selectedFormationCode;
      this.loadSelectedFormation(data.selectedFormationCode);
    }

    if (data.wallet) {
      if (data.wallet.gold !== undefined && data.wallet.gold !== null) {
        this.rawGold = data.wallet.gold;
        this.playerInfo.gold = this.formatCurrency(data.wallet.gold);
      }
      if (data.wallet.diamonds !== undefined && data.wallet.diamonds !== null) {
        this.playerInfo.diamond = this.formatCurrency(data.wallet.diamonds);
      }
    }
  }

  private loadSelectedFormation(code: string): void {
    if (!code || !this.formationService?.getFormationDetail) return;
    this.formationService.getFormationDetail(code).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: BaseResponse<FormationDetailDto>) => {
        if (!res?.success || !res.data?.slots) return;
        if (res.data.name) {
          this.selectedFormationName = res.data.name;
        }
        const deployedSlots = res.data.slots
          .filter(slot => slot.hero !== null)
          .sort((a, b) => a.slot - b.slot);

        if (deployedSlots.length > 0) {
          this.mainTeam = deployedSlots.slice(0, 5).map((slot, index) => {
            const hero = slot.hero!;
            return {
              id: hero.id,
              slot: slot.slot,
              name: hero.name,
              level: hero.level ?? 1,
              stars: hero.stars ?? 1,
              power: hero.power ?? 0,
              rarityCode: hero.rarityCode || 'EPIC',
              color: hero.rarityColorHex || this.defaultSquad[index % this.defaultSquad.length].color,
              role: hero.className || hero.factionName || 'Tướng Biệt Đội',
              avatar: hero.avatar || this.defaultSquad[index % this.defaultSquad.length].avatar
            };
          });
        }
      },
      error: () => {
        // Keep fallback squad on error
      }
    });
  }

  onHeroSlotClick(hero: TeamMember): void {
    if (hero.isEmpty) {
      this.isFormationManagementOpen = true;
      return;
    }
    this.isHeroManagementOpen = true;
  }

  getStarArray(stars?: number): number[] {
    const count = Math.max(1, Math.min(6, stars ?? 3));
    return Array.from({ length: count }, (_, index) => index);
  }

  onAvatarChanged(profile: PlayerProfileDto): void {
    this.playerProfile = profile;
    this.playerInfo.avatarUrl = this.playerService.resolveAvatarUrl(profile);
    this.isAvatarSelectorOpen = false;
  }

  refreshPower(): void {
    this.playerService.getGameInfo('none').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        if (res?.success && res.data) {
          const power = res.data.formationPower ?? res.data.profile?.power ?? 0;
          this.playerInfo.power = power;
          if (res.data.selectedFormationName) {
            this.selectedFormationName = res.data.selectedFormationName;
          }
          if (res.data.selectedFormationCode) {
            this.selectedFormationCode = res.data.selectedFormationCode;
            this.loadSelectedFormation(res.data.selectedFormationCode);
          }
          if (res.data.profile) {
            this.playerProfile = res.data.profile;
            this.playerInfo.avatarUrl = this.playerService.resolveAvatarUrl(res.data.profile);
            if (res.data.profile.playerName) this.playerInfo.name = res.data.profile.playerName;
            if (res.data.profile.level) this.playerInfo.level = res.data.profile.level;
            this.playerInfo.exp = res.data.profile.exp ?? 0;
            this.playerInfo.maxExp = Math.max(1, res.data.profile.maxExp ?? 1000);
          }
          if (res.data.wallet) {
            if (res.data.wallet.gold !== undefined && res.data.wallet.gold !== null) {
              this.rawGold = res.data.wallet.gold;
              this.playerInfo.gold = this.formatCurrency(res.data.wallet.gold);
            }
            if (res.data.wallet.diamonds !== undefined && res.data.wallet.diamonds !== null) {
              this.playerInfo.diamond = this.formatCurrency(res.data.wallet.diamonds);
            }
          }
        }
      },
      error: (err) => reportAppWarning('Could not refresh player combat power.', err)
    });
  }

  onHeroManagementClosed(): void {
    this.isHeroManagementOpen = false;
    this.refreshPower();
  }

  onFormationManagementClosed(): void {
    this.isFormationManagementOpen = false;
    this.refreshPower();
  }

  onInventoryClosed(): void {
    this.isInventoryOpen = false;
    this.refreshPower();
  }

  onForgeClosed(): void {
    this.isForgeOpen = false;
    this.refreshPower();
  }

  onForgeItemUpdated(): void {
    this.refreshPower();
    this.refreshWallet();
  }

  refreshWallet(): void {
    this.playerService.getWallet('none').subscribe({
      next: (res) => {
        if (res && res.success && res.data) {
          if (res.data.gold !== undefined && res.data.gold !== null) {
            this.rawGold = res.data.gold;
            this.playerInfo.gold = this.formatCurrency(res.data.gold);
          }
          if (res.data.diamonds !== undefined && res.data.diamonds !== null) {
            this.playerInfo.diamond = this.formatCurrency(res.data.diamonds);
          }
        }
      },
      error: (err) => {
        reportAppWarning('Could not refresh player wallet, using cached values.', err);
      }
    });
  }

  private formatCurrency(value: number): string {
    if (value >= 10000) {
      const van = value / 10000;
      return `${Number.isInteger(van) ? van : van.toFixed(1)} Vạn`;
    }
    return value.toLocaleString('vi-VN');
  }

  toggleMoreMenu(): void {
    this.showMoreMenu = !this.showMoreMenu;
  }

  buyStamina(): void {
    this.dungeonApiService.purchaseStamina().subscribe({
      next: response => {
        if (!response.success || !response.data) return;
        this.playerInfo.stamina = response.data.current;
        this.playerInfo.maxStamina = response.data.max;
        this.refreshWallet();
      },
      error: error => this.toast.fromError(error, 'Không thể mua thể lực.')
    });
  }

  buyGold(): void {
    this.toast.info('Chức năng mua Vàng sẽ sớm ra mắt!');
  }

  buyDiamonds(): void {
    this.toast.info('Chức năng nạp Kim Cương sẽ sớm ra mắt!');
  }

  openLogoutConfirm(): void {
    this.logoutError = '';
    this.isLogoutConfirmOpen = true;
  }

  closeLogoutConfirm(): void {
    if (this.isLoggingOut) return;
    this.isLogoutConfirmOpen = false;
    this.logoutError = '';
  }

  onFeatureClick(feature: FeatureItem): void {
    switch (feature.actionCode) {
      case 'CHECK_IN':
        if (!feature.locked) this.router.navigate(['/dcs-game/check-in']);
        else this.toast.warning('Điểm danh hiện đang bị khóa.');
        return;
      case 'SUMMON':
        if (feature.locked) this.toast.warning('Chiêu mộ hiện đang bị khóa.');
        else this.router.navigate(['/dcs-game/summon']);
        return;
      case 'HERO_MANAGEMENT': this.isHeroManagementOpen = true; return;
      case 'FORMATION_MANAGEMENT': this.isFormationManagementOpen = true; return;
      case 'INVENTORY': this.isInventoryOpen = true; return;
      case 'FORGE': this.isForgeOpen = true; return;
      case 'LIBRARY': this.isLibraryOpen = true; return;
      case 'BATTLE': this.router.navigate(['/dcs-game/campaign/dungeons']); return;
      case 'DEMO_BATTLE': this.router.navigate(['/dcs-game/battle/demo']); return;
      case 'CAMPAIGN': this.router.navigate(['/dcs-game/campaign']); return;
      case 'LOGOUT': this.openLogoutConfirm(); return;
    }
    if (feature.name === 'Đăng Xuất' || feature.name === 'Trở Về') {
      this.openLogoutConfirm();
    } else if (feature.name === 'Võ Tướng') {
      this.isHeroManagementOpen = true;
    } else if (feature.name.toLocaleLowerCase('vi') === 'chiêu mộ') {
      if (feature.locked) this.toast.warning('Chiêu mộ hiện đang bị khóa.');
      else this.router.navigate(['/dcs-game/summon']);
    } else if (feature.name === 'Đội Ngũ') {
      this.isFormationManagementOpen = true;
    } else if (feature.name === 'Hành Trang') {
      this.isInventoryOpen = true;
    } else if (feature.name === 'Rèn' || feature.name === 'Forge') {
      this.isForgeOpen = true;
    } else if (feature.locked) {
      this.toast.warning(this.toast.text`Tính năng "${feature.name}" đang bị khóa!`);
    } else {
      this.toast.info(this.toast.text`Đang chuyển đến tính năng: ${feature.name}`);
    }
  }

  logout(): void {
    if (this.isLoggingOut) return;
    this.isLoggingOut = true;
    this.logoutError = '';

    this.hrkApiService.CallApi(ApiMethod.POST, ApiEndpoints.Auth.Logout, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.isLoggingOut = false;
        this.isLogoutConfirmOpen = false;
        this.tokenManager.clearTokens();
        void this.processRealtimeService.stop();
        this.router.navigate(['/login'], {
          queryParams: { app: 'dcs-game', returnUrl: '/dcs-game/home' }
        });
      },
      error: (err) => {
        reportAppWarning('Logout API error or expired session, clearing local tokens anyway.', err);
        this.isLoggingOut = false;
        this.isLogoutConfirmOpen = false;
        this.tokenManager.clearTokens();
        void this.processRealtimeService.stop();
        this.router.navigate(['/login'], {
          queryParams: { app: 'dcs-game', returnUrl: '/dcs-game/home' }
        });
      }
    });
  }

  getNumericGold(): number {
    return this.rawGold;
  }

  goToBattle(): void {
    if (this.focusFeature) {
      this.onFeatureClick(this.focusFeature);
      return;
    }
    this.router.navigate(['/dcs-game/campaign/dungeons']);
  }

  goToCampaignHub(): void {
    this.router.navigate(['/dcs-game/campaign']);
  }
}
