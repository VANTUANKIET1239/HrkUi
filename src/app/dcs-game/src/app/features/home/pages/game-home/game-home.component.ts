import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeroManagementComponent } from '../../components/hero-management/hero-management.component';
import { FormationManagementComponent } from '../../components/formation-management/formation-management.component';

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

@Component({
  selector: 'app-game-home',
  standalone: true,
  imports: [CommonModule, HeroManagementComponent, FormationManagementComponent],
  templateUrl: './game-home.component.html',
  styleUrl: './game-home.component.scss'
})
export class GameHomeComponent implements OnInit {
  isHeroManagementOpen = false;
  isFormationManagementOpen = false;
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
    { name: 'Nữ Thần', icon: 'bi-gem', hasNotification: false },
    { name: 'Thần Binh', icon: 'bi-lightning-charge-fill', hasNotification: false },
    { name: 'Hành Trang', icon: 'bi-briefcase-fill', hasNotification: false },
    { name: 'Quân Đoàn', icon: 'bi-flag-fill', hasNotification: true },
    { name: 'Thương Tiệm', icon: 'bi-shop', hasNotification: false },
    { name: 'Nội Chính', icon: 'bi-bank', hasNotification: false }
  ];

  bottomFeaturesRight: FeatureItem[] = [
    { name: 'Hộ Tống', icon: 'bi-truck', hasNotification: false },
    { name: 'Xuất Chinh', icon: 'bi-compass', hasNotification: true },
    { name: 'Chiến Dịch', icon: 'bi-map-fill', hasNotification: false }
  ];

  showMoreMenu = false;

  constructor(private router: Router) {}

  ngOnInit(): void {}

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
    if (feature.name === 'Võ Tướng') {
      this.isHeroManagementOpen = true;
    } else if (feature.name === 'Đội Ngũ') {
      this.isFormationManagementOpen = true;
    } else if (feature.locked) {
      alert(`Tính năng "${feature.name}" đang bị khóa!`);
    } else {
      alert(`Đang chuyển đến tính năng: ${feature.name}`);
    }
  }

  goToBattle(): void {
    this.router.navigate(['/dcs-game/battle']);
  }
}
