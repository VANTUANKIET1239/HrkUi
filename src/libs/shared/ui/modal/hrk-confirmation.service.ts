import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HrkModalConfig } from './modal-config';

interface ConfirmationRequest {
  code: string;
  config: Partial<HrkModalConfig>;
  parameters: Record<string, string | number>;
  promise: Promise<boolean>;
  resolve: (confirmed: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class HrkConfirmationService {
  private readonly current = signal<ConfirmationRequest | null>(null);
  readonly active = this.current.asReadonly();
  private readonly queue: ConfirmationRequest[] = [];
  constructor() {
    inject(Router, { optional:true })?.events.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(event => {
      if (event instanceof NavigationStart) this.cancelAll();
    });
  }

  confirm(code: string, config: Partial<HrkModalConfig> = {}, parameters: Record<string, string | number> = {}): Promise<boolean> {
    // Duplicate clicks reuse the pending question instead of opening additional dialogs.
    const existing = [this.current(), ...this.queue].find(request => request?.code === code);
    if (existing) return existing.promise;
    let resolve!: (confirmed: boolean) => void;
    const promise = new Promise<boolean>(done => resolve = done);
    const request = { code, config, parameters, promise, resolve };
    if (this.current()) this.queue.push(request);
    else this.current.set(request);
    return promise;
  }

  settle(confirmed: boolean): void {
    const current = this.current();
    if (!current) return;
    this.current.set(null);
    current.resolve(confirmed);
    // Give Angular a render boundary so each request gets a fresh dialog/focus lifecycle.
    setTimeout(() => { if (!this.current()) this.current.set(this.queue.shift() ?? null); });
  }

  cancelAll(): void {
    this.current()?.resolve(false);
    this.current.set(null);
    this.queue.splice(0).forEach(request => request.resolve(false));
  }
}
