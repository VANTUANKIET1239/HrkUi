import { Component, effect, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../../core/loading/loading.service';

@Component({
  selector: 'app-global-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-loading.component.html',
  styleUrl: './global-loading.component.scss'
})
export class GlobalLoadingComponent implements OnDestroy {
  readonly loadingService = inject(LoadingService);

  constructor() {
    effect(() => {
      const isLoading = this.loadingService.isLoading();
      if (typeof document !== 'undefined') {
        if (isLoading) {
          document.body.classList.add('global-loading-active');
        } else {
          document.body.classList.remove('global-loading-active');
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('global-loading-active');
    }
  }
}
