import { Component, inject, signal } from '@angular/core';
import { AssetUrlService } from '../libs/core/assets/asset-url.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  host: { '[style.--hrk-lobby-background]': 'lobbyBackground' },
  styleUrl: './app.scss'
})
export class App {
  protected readonly lobbyBackground = inject(AssetUrlService).background('images/dcs-game/backgrounds/lobby-bg.png');
  protected readonly title = signal('HrkUi');
}
