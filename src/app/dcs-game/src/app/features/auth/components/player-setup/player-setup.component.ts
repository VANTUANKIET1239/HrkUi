import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, exhaustMap, of, Subscription, take, takeWhile, timer, timeout } from 'rxjs';
import { HrkTranslatePipe } from '@hrk/localization/hrk-translate.pipe';
import { PlayerService } from '../../../../core/services/player.service';
import { HrkApiService } from '../../../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { TokenManagerService } from '../../../../../../../../libs/core/auth/services/token-manager';
import { ApiEndpoints } from '../../../../../../../../libs/shared/common/constants/api-endpoints';

@Component({
  standalone: true,
  imports: [HrkTranslatePipe],
  template: `
    <main class="setup" aria-labelledby="setup-title">
      <section class="setup-card">
        <span class="setup-icon" aria-hidden="true">✦</span>
        <h1 id="setup-title">{{ 'Chuẩn bị hành trình' | hrkTranslate }}</h1>
        <p role="status" aria-live="polite">{{ message() | hrkTranslate }}</p>
        @if (waiting()) {
          <div class="setup-progress" aria-hidden="true"></div>
        } @else {
          <button type="button" [disabled]="signingOut()" (click)="start()">{{ 'Thử lại' | hrkTranslate }}</button>
        }
        <button class="setup-exit" type="button" [disabled]="signingOut()" (click)="signOut()">{{ 'Quay lại đăng nhập' | hrkTranslate }}</button>
      </section>
    </main>`,
  styles: [`
    :host { display: block; color: var(--color-text, #eef5ff); }
    .setup { min-height: 100dvh; display: grid; place-items: center; padding: 24px; box-sizing: border-box;
      background: radial-gradient(ellipse at top, #223b43, #0d131c 70%); }
    .setup-card { width: min(100%, 440px); box-sizing: border-box; padding: 32px; border: 1px solid #48616b;
      border-radius: 20px; background: #141e29; text-align: center; box-shadow: 0 20px 60px #0005; }
    h1 { font-size: 26px; } p { line-height: 1.6; color: #b9cad9; } .setup-icon { font-size: 40px; color: #c0ed73; }
    button { display: block; width: 100%; min-height: 44px; border: 0; border-radius: 10px; background: #c0ed73;
      color: #172411; font: inherit; cursor: pointer; margin-top: 24px; }
    .setup-exit { background: transparent; color: #b4d8fa; text-decoration: underline; }
    button:disabled { opacity: .5; cursor: wait; }
    .setup-progress { height: 4px; border-radius: 4px; margin-top: 24px;
      background: linear-gradient(90deg, #223742, #c0ed73, #223742); background-size: 200% 100%; animation: progress 2s linear infinite; }
    @keyframes progress { to { background-position: -200% 0; } }
    @media(prefers-reduced-motion: reduce) { .setup-progress { animation: none; } }
  `]
})
export class PlayerSetupComponent implements OnInit {
  private readonly players = inject(PlayerService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy = inject(DestroyRef);
  private readonly api = inject(HrkApiService);
  private readonly tokens = inject(TokenManagerService);
  private polling?: Subscription;
  readonly waiting = signal(true);
  readonly signingOut = signal(false);
  readonly message = signal('Đang chuẩn bị nhân vật và tài nguyên khởi đầu của bạn.');

  ngOnInit(): void { this.start(); }

  signOut(): void {
    if (this.signingOut()) return;
    this.signingOut.set(true);
    this.polling?.unsubscribe();
    this.api.CallApi('POST', ApiEndpoints.Auth.Logout, {}, { withCredentials: true }).pipe(
      timeout(5000), catchError(() => of(null)), takeUntilDestroyed(this.destroy)
    ).subscribe(() => {
      this.tokens.clearTokens();
      void this.router.navigate(['/login'], { queryParams: { app: 'dcs-game', returnUrl: '/dcs-game/home' } });
    });
  }

  start(): void {
    this.polling?.unsubscribe();
    this.waiting.set(true);
    this.message.set('Đang chuẩn bị nhân vật và tài nguyên khởi đầu của bạn.');
    let finished = false;
    this.polling = timer(0, 2000).pipe(
      take(16),
      exhaustMap(() => this.players.getInitialization().pipe(catchError(() => of(null)))),
      takeWhile(response => response?.data?.status !== 'Ready' && response?.data?.status !== 'Unavailable', true),
      takeUntilDestroyed(this.destroy)
    ).subscribe({
      next: response => {
        if (response?.data?.status === 'Ready') {
          finished = true;
          const requested = this.route.snapshot.queryParamMap.get('returnUrl');
          // Only internal game routes may be resumed; never redirect to an external URL or back to setup.
          const target = requested && /^\/dcs-game\/(home|battle|campaign|summon|check-in)(?:[/?#]|$)/.test(requested)
            ? requested : '/dcs-game/home';
          void this.router.navigateByUrl(target, { replaceUrl: true });
        } else if (response?.data?.status === 'Unavailable') {
          finished = true;
          this.waiting.set(false);
          this.message.set('Nhân vật hiện không khả dụng. Vui lòng liên hệ hỗ trợ.');
        }
      },
      complete: () => {
        if (finished) return;
        this.waiting.set(false);
        this.message.set('Quá trình chuẩn bị đang mất nhiều thời gian hơn dự kiến. Vui lòng thử lại sau.');
      }
    });
  }
}
