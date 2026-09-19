import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HeroManagementComponent } from '../../components/hero-management/hero-management.component';
import { FormationManagementComponent } from '../../components/formation-management/formation-management.component';
import { InventoryComponent } from '../../components/inventory/inventory.component';
import { ForgeComponent } from '../../components/forge/forge.component';

interface PlayerInfo {
  name: string;
  level: number;
  vip: number;
  power: number;
  stamina: number;
  maxStamina: number;
  gold: string;
  diamond: string;
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
import { HrkApiService } from '../../../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { ApiMethod } from '../../../../../../../../libs/shared/common/constants/ApiMethod.constants';
import { ApiEndpoints } from '../../../../../../../../libs/shared/common/constants/api-endpoints';
import { PlayerService } from '../../../../core/services/player.service';
import { GameHomeInitializationService, GameHomeInitialData } from '../../services/game-home-initialization.service';
import { GameFeatureConfigService } from '../../../../core/services/game-feature-config.service';
import { GameFeatureConfig } from '../../../../core/models/game-feature-config.model';

@Component({
  selector: 'app-game-home',
  standalone: true,
  imports: [CommonModule, HeroManagementComponent, FormationManagementComponent, InventoryComponent, ForgeComponent],
  templateUrl: './game-home.component.html',
  styleUrl: './game-home.component.scss'
})
export class GameHomeComponent implements OnInit {
  isHeroManagementOpen = false;
  isFormationManagementOpen = false;
  isInventoryOpen = false;
  isForgeOpen = false;
  playerInfo: PlayerInfo = {
    name: 'Runy997_8T6y',
    level: 120,
    vip: 10,
    power: 4493,
    stamina: 4104,
    maxStamina: 200,
    gold: '59 Vạn',
    diamond: '9973 Vạn'
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
    private gameFeatureConfigService: GameFeatureConfigService
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
      if (data.profile.playerName) {
        this.playerInfo.name = data.profile.playerName;
      }
      if (data.profile.level) {
        this.playerInfo.level = data.profile.level;
      }
    }

    if (data.wallet) {
      if (data.wallet.gold !== undefined && data.wallet.gold !== null) {
        this.playerInfo.gold = this.formatCurrency(data.wallet.gold);
      }
      if (data.wallet.diamonds !== undefined && data.wallet.diamonds !== null) {
        this.playerInfo.diamond = this.formatCurrency(data.wallet.diamonds);
      }
    }
  }

  refreshWallet(): void {
    this.playerService.getWallet('none').subscribe({
      next: (res) => {
        if (res && res.success && res.data) {
          if (res.data.gold !== undefined && res.data.gold !== null) {
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
    this.playerInfo.stamina += 50;
    alert('Mua Thể Lực thành công! (+50 Thể Lực)');
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
      case 'BATTLE': this.router.navigate(['/dcs-game/battle']); return;
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

  onForgeItemUpdated(): void {
    this.refreshWallet();
  }

  logout(): void {
    this.isLoggingOut = true;
    this.logoutError = '';

    this.hrkApiService.CallApi(ApiMethod.POST, ApiEndpoints.Auth.Logout, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.isLoggingOut = false;
        this.isLogoutConfirmOpen = false;
        this.tokenManager.clearTokens();
        this.router.navigate(['/dcs-game/auth']);
      },
      error: (err) => {
        console.warn('Logout API error or expired session, clearing local tokens anyway.', err);
        this.isLoggingOut = false;
        this.isLogoutConfirmOpen = false;
        this.tokenManager.clearTokens();
        this.router.navigate(['/dcs-game/auth']);
      }
    });
  }

  getNumericGold(): number {
    return 590000;
  }

  goToBattle(): void {
    if (this.focusFeature) {
      this.onFeatureClick(this.focusFeature);
      return;
    }
    this.router.navigate(['/dcs-game/battle']);
  }
}
