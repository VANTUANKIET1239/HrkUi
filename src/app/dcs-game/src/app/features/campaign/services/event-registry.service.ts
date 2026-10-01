import { Injectable, Type } from '@angular/core';

export interface EventRegistration {
  eventType: string;
  routePath: string;
  displayName: string;
  themeColor: string;
  icon: string;
  componentLoader?: () => Promise<Type<any>>;
}

@Injectable({ providedIn: 'root' })
export class EventRegistryService {
  private readonly registry = new Map<string, EventRegistration>();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    this.register({
      eventType: 'TOWER',
      routePath: '/dcs-game/campaign/events/tower',
      displayName: 'Leo Tháp Vô Tận',
      themeColor: '#e67e22',
      icon: 'bi-building-up'
    });
  }

  register(config: EventRegistration): void {
    this.registry.set(config.eventType.toUpperCase(), config);
  }

  getRegistration(eventType: string): EventRegistration | undefined {
    return this.registry.get(eventType.toUpperCase());
  }

  getRouteForEvent(eventType: string): string {
    const reg = this.getRegistration(eventType);
    return reg ? reg.routePath : '/dcs-game/campaign';
  }

  getAllRegistrations(): EventRegistration[] {
    return Array.from(this.registry.values());
  }
}
