import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-campaign-atmosphere',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './campaign-atmosphere.component.html',
  styleUrl: './campaign-atmosphere.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignAtmosphereComponent {
  // Pre-configured 12 particles with varied positions, sizes and animation delays
  readonly particles = [
    { left: '8%', top: '15%', size: 4, delay: '0s', duration: '9s' },
    { left: '22%', top: '75%', size: 6, delay: '2s', duration: '11s' },
    { left: '35%', top: '30%', size: 3, delay: '1s', duration: '8s' },
    { left: '48%', top: '85%', size: 5, delay: '3.5s', duration: '12s' },
    { left: '60%', top: '20%', size: 4, delay: '0.5s', duration: '10s' },
    { left: '75%', top: '65%', size: 5, delay: '2.5s', duration: '9.5s' },
    { left: '88%', top: '40%', size: 3, delay: '4s', duration: '13s' },
    { left: '15%', top: '50%', size: 5, delay: '1.8s', duration: '10.5s' },
    { left: '42%', top: '10%', size: 4, delay: '3s', duration: '8.5s' },
    { left: '68%', top: '88%', size: 6, delay: '1.2s', duration: '11.5s' },
    { left: '82%', top: '12%', size: 3, delay: '2.8s', duration: '9s' },
    { left: '92%', top: '78%', size: 5, delay: '0.8s', duration: '10s' },
  ];
}
