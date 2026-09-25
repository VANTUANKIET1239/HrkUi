import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GameLoginComponent } from '../../components/game-login/game-login.component';
import { GameRegisterComponent } from '../../components/game-register/game-register.component';
import { AppAuthConfig, getAppAuthConfig } from '../../../../../../../../libs/core/auth/config/app-auth.config';

@Component({
  selector: 'app-game-auth',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    GameLoginComponent,
    GameRegisterComponent
  ],
  templateUrl: './game-auth.component.html',
  styleUrl: './game-auth.component.scss'
})
export class GameAuthComponent implements OnInit {
  activeTab = signal<'login' | 'register'>('login');
  appConfig: AppAuthConfig = getAppAuthConfig();

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.appConfig = getAppAuthConfig(this.route.snapshot.queryParamMap.get('app'));
    // Determine active tab from current route path or query param
    const path = this.router.url;
    if (path.includes('register')) {
      this.activeTab.set('register');
    } else {
      this.activeTab.set('login');
    }
  }

  setTab(tab: 'login' | 'register'): void {
    this.activeTab.set(tab);
  }
}
