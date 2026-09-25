import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerAvatarTemplateDto, PlayerProfileDto } from '../../../../core/models/player.model';
import { PlayerService } from '../../../../core/services/player.service';

@Component({
  selector: 'app-avatar-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar-selector.component.html',
  styleUrl: './avatar-selector.component.scss'
})
export class AvatarSelectorComponent implements OnInit, OnDestroy {
  @Input({ required: true }) profile!: PlayerProfileDto;
  @Input() currentAvatarUrl = '';
  @Output() close = new EventEmitter<void>();
  @Output() avatarChanged = new EventEmitter<PlayerProfileDto>();

  tab: 'gallery' | 'upload' = 'gallery';
  avatars: PlayerAvatarTemplateDto[] = [];
  selectedId?: number;
  selectedFile?: File;
  previewUrl = '';
  loading = true;
  saving = false;
  error = '';

  constructor(private readonly playerService: PlayerService) {}

  ngOnInit(): void {
    this.selectedId = this.profile.avatarTemplateId;
    this.playerService.getAvatars().subscribe({
      next: response => { this.avatars = response.data ?? []; this.loading = false; },
      error: () => { this.error = 'Không thể tải kho ảnh đại diện.'; this.loading = false; }
    });
  }

  chooseTemplate(id: number): void { this.selectedId = id; this.error = ''; }

  saveTemplate(): void {
    if (!this.selectedId || this.saving) return;
    this.saving = true; this.error = '';
    this.playerService.selectAvatar(this.selectedId).subscribe({
      next: response => this.finish(response),
      error: error => this.fail(error?.message || 'Không thể đổi ảnh đại diện.')
    });
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.clearPreview(); this.error = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.error = 'Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP.'; input.value = ''; return;
    }
    if (file.size > 1024 * 1024) {
      this.error = 'Ảnh vượt quá dung lượng tối đa 1 MB.'; input.value = ''; return;
    }
    const url = URL.createObjectURL(file);
    try {
      const dimensions = await this.readDimensions(url);
      if (dimensions.width > 1024 || dimensions.height > 1024 || dimensions.width * dimensions.height > 1024 * 1024) {
        URL.revokeObjectURL(url);
        this.error = `Ảnh ${dimensions.width}×${dimensions.height} vượt giới hạn 1024×1024.`;
        input.value = ''; return;
      }
      this.selectedFile = file; this.previewUrl = url;
    } catch {
      URL.revokeObjectURL(url); this.error = 'Không thể đọc nội dung ảnh.'; input.value = '';
    }
  }

  upload(): void {
    if (!this.selectedFile || this.saving) return;
    this.saving = true; this.error = '';
    this.playerService.uploadCustomAvatar(this.selectedFile).subscribe({
      next: response => this.finish(response),
      error: error => this.fail(error?.message || 'Không thể tải ảnh đại diện.')
    });
  }

  removeCustom(): void {
    if (this.saving) return;
    this.saving = true; this.error = '';
    this.playerService.deleteCustomAvatar().subscribe({
      next: response => this.finish(response),
      error: error => this.fail(error?.message || 'Không thể xóa ảnh cá nhân.')
    });
  }

  ngOnDestroy(): void { this.clearPreview(); }

  private finish(response: { success: boolean; message?: string; data: PlayerProfileDto }): void {
    if (!response.success || !response.data) { this.fail(response.message || 'Thao tác không thành công.'); return; }
    this.saving = false; this.avatarChanged.emit(response.data);
  }
  private fail(message: string): void { this.saving = false; this.error = message; }
  private clearPreview(): void { if (this.previewUrl) URL.revokeObjectURL(this.previewUrl); this.previewUrl = ''; this.selectedFile = undefined; }
  private readDimensions(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight }); image.onerror = reject; image.src = url; });
  }
}
