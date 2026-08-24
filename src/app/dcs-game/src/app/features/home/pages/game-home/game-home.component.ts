import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeroManagementComponent } from '../../components/hero-management/hero-management.component';
import { FormationManagementComponent } from '../../components/formation-management/formation-management.component';
import { InventoryComponent } from '../../components/inventory/inventory.component';

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
  icon: string;
  hasNotification: boolean;
  locked?: boolean;
}

import { TokenManagerService } from '../../../../../../../../libs/core/auth/services/token-manager';
import { HrkApiService } from '../../../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { ApiMethod } from '../../../../../../../../libs/shared/common/constants/ApiMethod.constants';
import { ApiEndpoints } from '../../../../../../../../libs/shared/common/constants/api-endpoints';
import { PlayerService } from '../../../../core/services/player.service';

@Component({
  selector: 'app-game-home',
  standalone: true,
  imports: [CommonModule, HeroManagementComponent, FormationManagementComponent, InventoryComponent],
  templateUrl: './game-home.component.html',
  styleUrl: './game-home.component.scss'
})
export class GameHomeComponent implements OnInit {
  isHeroManagementOpen = false;
  isFormationManagementOpen = false;
  isInventoryOpen = false;
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

  topEvents: FeatureItem[] = [
    { name: 'Nạp Đầu', icon: 'bi-gift-fill', hasNotification: true },
    { name: 'Chiêu Mộ', icon: 'bi-people-fill', hasNotification: true },
    { name: 'Sự Kiện', icon: 'bi-calendar-event-fill', hasNotification: true },
    { name: 'Phúc Lợi', icon: 'bi-award-fill', hasNotification: true },
    { name: 'Chiêu Tài', icon: 'bi-coin', hasNotification: true },
    { name: 'Báo Danh', icon: 'bi-check-circle-fill', hasNotification: true },
    { name: 'Trở Về', icon: 'bi-arrow-left-circle-fill', hasNotification: false }
  ];

  bottomFeaturesLeft: FeatureItem[] = [
    { name: 'Võ Tướng', icon: 'bi-shield-shaded', hasNotification: false },
    { name: 'Đội Ngũ', icon: 'bi-grid-3x3-gap-fill', hasNotification: false },
    { name: 'Hành Trang', icon: 'bi-briefcase-fill', hasNotification: false },
  ];

  bottomFeaturesRight: FeatureItem[] = [
    { name: 'Hộ Tống', icon: 'bi-truck', hasNotification: false },
    { name: 'Xuất Chinh', icon: 'bi-compass', hasNotification: true },
    { name: 'Chiến Dịch', icon: 'bi-map-fill', hasNotification: false }
  ];

  showMoreMenu = false;

  constructor(
    private router: Router,
    private tokenManager: TokenManagerService,
    private hrkApiService: HrkApiService,
    private playerService: PlayerService
  ) { }

  ngOnInit(): void {
    this.loadPlayerData();
  }

  loadPlayerData(): void {
    this.loadPlayerProfile();
    this.loadPlayerWallet();
  }

  loadPlayerProfile(): void {
    this.playerService.getProfile().subscribe({
      next: (res) => {
        if (res && res.success && res.data) {
          if (res.data.playerName) {
            this.playerInfo.name = res.data.playerName;
          }
          if (res.data.level) {
            this.playerInfo.level = res.data.level;
          }
        }
      },
      error: (err) => {
        console.warn('Could not fetch player profile from backend API, using cached values.', err);
      }
    });
  }

  loadPlayerWallet(): void {
    this.playerService.getWallet().subscribe({
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
        console.warn('Could not fetch player wallet from backend API, using cached values.', err);
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

  onFeatureClick(feature: FeatureItem): void {
    if (feature.name === 'Trở Về') {
      this.logout();
    } else if (feature.name === 'Võ Tướng') {
      this.isHeroManagementOpen = true;
    } else if (feature.name === 'Đội Ngũ') {
      this.isFormationManagementOpen = true;
    } else if (feature.name === 'Hành Trang') {
      this.isInventoryOpen = true;
    } else if (feature.locked) {
      alert(`Tính năng "${feature.name}" đang bị khóa!`);
    } else {
      alert(`Đang chuyển đến tính năng: ${feature.name}`);
    }
  }

  logout(): void {
    this.hrkApiService.CallApi(ApiMethod.POST, ApiEndpoints.Auth.Logout, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.tokenManager.clearTokens();
        this.router.navigate(['/dcs-game/auth']);
      },
      error: () => {
        this.tokenManager.clearTokens();
        this.router.navigate(['/dcs-game/auth']);
      }
    });
  }

  goToBattle(): void {
    this.router.navigate(['/dcs-game/battle']);
  }
}

