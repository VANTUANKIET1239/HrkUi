import { Component, EventEmitter, inject, Output } from '@angular/core';
import { HrkTranslatePipe } from '@hrk/localization/hrk-translate.pipe';
import { LanguageSelectorComponent } from '@hrk/localization/language-selector.component';
import { LanguageService } from '@hrk/localization/language.service';
import { HrkModalComponent } from '../../../../../../../../libs/shared/ui/modal/hrk-modal.component';

@Component({
  selector: 'app-game-settings',
  standalone: true,
  imports: [HrkModalComponent, LanguageSelectorComponent, HrkTranslatePipe],
  templateUrl: './game-settings.component.html',
  styleUrl: './game-settings.component.scss'
})
export class GameSettingsComponent {
  readonly language = inject(LanguageService);
  @Output() close = new EventEmitter<void>();
  @Output() logoutRequested = new EventEmitter<void>();

  requestLogout(): void {
    this.close.emit();
    this.logoutRequested.emit();
  }
}
