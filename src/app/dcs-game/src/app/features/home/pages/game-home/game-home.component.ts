import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HeroManagementComponent } from '../../components/hero-management/hero-management.component';
import { FormationManagementComponent } from '../../components/formation-management/formation-management.component';
import { InventoryComponent } from '../../components/inventory/inventory.component';
import { ForgeComponent } from '../../components/forge/forge.component';
import { LibraryComponent } from '../../components/library/library.component';
import { PlayerLevelBadgeComponent } from '../../components/player-level-badge/player-level-badge.component';
import { AvatarSelectorComponent } from '../../components/avatar-selector/avatar-selector.component';
import { EquipmentTooltipComponent } from '../../../../shared/components/equipment-tooltip/equipment-tooltip.component';
import { PlayerProfileDto } from '../../../../core/models/player.model';

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

interface TeamMember {
  name: string;
  level: number;
  title?: string;
  color: string;
  role: string;
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
  imports: [CommonModule, HeroManagementComponent, FormationManagementComponent, InventoryComponent, ForgeComponent, LibraryComponent, PlayerLevelBadgeComponent, AvatarSelectorComponent, EquipmentTooltipComponent],
  templateUrl: './game-home.component.html',
  styleUrl: './game-home.component.scss'
})
export class GameHomeComponent implements OnInit {
  isHeroManagementOpen = false;
  isFormationManagementOpen = false;
  isInventoryOpen = false;
  isForgeOpen = false;
  isLibraryOpen = false;
  isAvatarSelectorOpen = false;
  playerProfile?: PlayerProfileDto;
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

  mainTeam: TeamMember[] = [
    { name: 'Nghiêm Nhan', level: 1, color: '#4a3f35', role: 'Đỡ đòn / Hỗ trợ' },
    { name: 'Bàng Đức', level: 1, color: '#2c3e50', role: 'Đấu sĩ vật lý' },
    { name: 'Cao Thuận', level: 1, color: '#d35400', role: 'Sát thủ' },
    { name: 'Chúc Dung', level: 1, color: '#c0392b', role: 'Phép thuật / Hỏa' },
    { name: 'Lưu Bị', level: 2, color: '#8e44ad', role: 'Hỗ trợ / Hồi máu' }
  ];

  topEvents: FeatureItem[] = []; /*
    { name: 'Nạp Đầu', icon: 'bi-gift-fill', hasNotification: true },
    { name: 'Chiêu Mộ', icon: 'bi-people-fill', hasNotification: true },
    { name: 'Sự Kiện', icon: 'bi-calendar-event-fill', hasNotification: true },
    { name: 'Phúc Lợi', icon: 'bi-award-fill', hasNotification: true },
    { name: 'Chiêu Tài', icon: 'bi-coin', hasNotification: true },
    { name: 'Báo Danh', icon: 'bi-check-circle-fill', hasNotification: true },
    { name: 'Đăng Xuất', icon: 'bi-box-arrow-right', hasNotification: false }
  ];

  */ bottomFeaturesLeft: FeatureItem[] = []; /*
    { name: 'Võ Tướng', icon: 'bi-shield-shaded', hasNotification: false },
    { name: 'Đội Ngũ', icon: 'bi-grid-3x3-gap-fill', hasNotification: false },
    { name: 'Hành Trang', icon: 'bi-briefcase-fill', hasNotification: false },
    { name: 'Rèn', icon: 'bi-hammer', hasNotification: false },
  ];

  */ bottomFeaturesRight: FeatureItem[] = []; /*
    { name: 'Hộ Tống', icon: 'bi-truck', hasNotification: false },
    { name: 'Xuất Chinh', icon: 'bi-compass', hasNotification: true },
    { name: 'Chiến Dịch', icon: 'bi-map-fill', hasNotification: false }
  ]; */

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

  private loadFeatureConfigs(): void {
    this.gameFeatureConfigService.getFeatures().subscribe({
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
      error: error => console.warn('Could not load game feature configuration.', error)
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

  onAvatarChanged(profile: PlayerProfileDto): void {
    this.playerProfile = profile;
    this.playerInfo.avatarUrl = this.playerService.resolveAvatarUrl(profile);
    this.isAvatarSelectorOpen = false;
  }

  refreshPower(): void {
    this.playerService.getGameInfo('none').subscribe({
      next: (res) => {
        if (res?.success && res.data) {
          const power = res.data.formationPower ?? res.data.profile?.power ?? 0;
          this.playerInfo.power = power;
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
      error: (err) => console.warn('Could not refresh player combat power.', err)
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
        console.warn('Could not refresh player wallet, using cached values.', err);
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
      error: error => alert(error?.error?.message ?? 'Không thể mua thể lực.')
    });
  }

  buyGold(): void {
    alert('Chức năng mua Vàng sẽ sớm ra mắt!');
  }

  buyDiamonds(): void {
    alert('Chức năng nạp Kim Cương sẽ sớm ra mắt!');
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
    // Navigation is driven by ActionCode from HRK_GameFeatureConfigs, not display text.
    switch (feature.actionCode) {
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
    } else if (feature.name === 'Đội Ngũ') {
      this.isFormationManagementOpen = true;
    } else if (feature.name === 'Hành Trang') {
      this.isInventoryOpen = true;
    } else if (feature.name === 'Rèn' || feature.name === 'Forge') {
      this.isForgeOpen = true;
    } else if (feature.locked) {
      alert(`Tính năng "${feature.name}" đang bị khóa!`);
    } else {
      alert(`Đang chuyển đến tính năng: ${feature.name}`);
    }
  }

  logout(): void {
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
        console.warn('Logout API error or expired session, clearing local tokens anyway.', err);
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
}
