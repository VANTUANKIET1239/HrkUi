import { Component, inject, signal } from '@angular/core';
import { AssetUrlService } from '../../../../libs/core/assets/asset-url.service';
import { RouterOutlet } from '@angular/router';
import { GameToastComponent } from './shared/components/game-toast/game-toast.component';
import { HrkConfirmationHostComponent } from '../../../../libs/shared/ui/modal/hrk-confirmation-host.component';
import { HRK_MODAL_CONFIG_SOURCE } from '../../../../libs/shared/ui/modal/modal-config';
import { GameModalConfigService } from './core/services/game-modal-config.service';
import { EquipmentTooltipComponent } from './shared/components/equipment-tooltip/equipment-tooltip.component';
import { HrkModalFloatingDirective } from '../../../../libs/shared/ui/modal/hrk-modal-floating.directive';

@Component({
  selector: 'app-root',
  host: {
    class: 'dcs-game-theme',
    '[style.--hrk-lobby-background]': 'lobbyBackground'
  },
  imports: [RouterOutlet, GameToastComponent, HrkConfirmationHostComponent, EquipmentTooltipComponent, HrkModalFloatingDirective],
  providers: [{ provide: HRK_MODAL_CONFIG_SOURCE, useExisting: GameModalConfigService }],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly lobbyBackground = inject(AssetUrlService).background('images/dcs-game/backgrounds/lobby-bg.png');
  protected readonly title = signal('DCS_GAME_UI');
}
