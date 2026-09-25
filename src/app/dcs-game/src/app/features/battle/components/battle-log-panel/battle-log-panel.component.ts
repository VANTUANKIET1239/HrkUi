import { Component, Input, ViewChild, ElementRef, AfterViewChecked, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-battle-log-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './battle-log-panel.component.html',
  styleUrl: './battle-log-panel.component.scss'
})
export class BattleLogPanelComponent implements AfterViewChecked, OnChanges {
  @Input() logs: string[] = [];
  @ViewChild('logBody') private logBody!: ElementRef;

  private shouldScroll = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['logs']) {
      this.shouldScroll = true;
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    try {
      this.logBody.nativeElement.scrollTop = this.logBody.nativeElement.scrollHeight;
    } catch (err) {}
  }

  parseLog(log: string): string {
    // Logs can contain lightweight **highlight** markers, but never raw HTML.
    let parsed = log
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    
    // Replace **Text** with highlight styling
    // 1st: Actor / Target highlighted in red/pink
    // 2nd: Skill names in green/emerald
    // 3rd: Critical tag in yellow
    
    // Simplistic regex for double stars
    const boldRegex = /\*\*(.*?)\*\*/g;
    let index = 0;
    parsed = parsed.replace(boldRegex, (match, text) => {
      index++;
      if (index === 1 || index === 3) {
        return `<span class="combat-highlight">${text}</span>`;
      } else {
        return `<span class="skill-highlight">${text}</span>`;
      }
    });

    parsed = parsed.replace('💥 CHÍ MẠNG', '<span class="crit-highlight">💥 CHÍ MẠNG</span>');

    return parsed;
  }

  getLogType(log: string): string {
    const value = log.toLocaleLowerCase('vi');
    if (value.includes('chí mạng') || value.includes('crit')) return 'critical';
    if (value.includes('hồi') || value.includes('heal') || value.includes('tái tạo')) return 'heal';
    if (value.includes('gục ngã') || value.includes('tử trận')) return 'death';
    if (value.includes('buff') || value.includes('khiên') || value.includes('tăng')) return 'buff';
    if (value.includes('debuff') || value.includes('giảm') || value.includes('choáng')) return 'debuff';
    if (value.includes('sát thương') || value.includes('damage') || value.includes('tấn công')) return 'damage';
    return 'system';
  }

  getLogIcon(log: string): string {
    const icons: Record<string, string> = {
      critical: 'bi-lightning-charge-fill', heal: 'bi-heart-pulse-fill', death: 'bi-skull-fill',
      buff: 'bi-shield-fill-plus', debuff: 'bi-shield-fill-x', damage: 'bi-crosshair', system: 'bi-stars'
    };
    return icons[this.getLogType(log)];
  }
}
