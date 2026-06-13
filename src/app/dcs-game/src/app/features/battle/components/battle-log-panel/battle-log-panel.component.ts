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
    // Escape standard characters then replace markdown bold elements
    let parsed = log;
    
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
}
