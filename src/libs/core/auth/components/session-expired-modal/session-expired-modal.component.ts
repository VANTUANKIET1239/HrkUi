import { HrkModalComponent } from '../../../../shared/ui/modal/hrk-modal.component';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HrkTranslatePipe } from '@hrk/localization/hrk-translate.pipe';
import { SessionExpiredService } from '../../services/session-expired.service';

@Component({
  selector: 'app-session-expired-modal',
  standalone: true,
  imports: [CommonModule, HrkModalComponent, HrkTranslatePipe],
  templateUrl: './session-expired-modal.component.html',
  styleUrl: './session-expired-modal.component.scss'
})
export class SessionExpiredModalComponent {
  readonly sessionExpiredService = inject(SessionExpiredService);

  onConfirmLogin(): void {
    this.sessionExpiredService.confirmLogin();
  }
}
