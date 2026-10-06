import { Injectable, inject } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { Observable, Subject, filter } from 'rxjs';
import { TokenManagerService } from '../../../../../../libs/core/auth/services/token-manager';
import { environment } from '../../../../../../../environments/dev/environment';
import { ProcessStatusUpdated } from '../models/process-status.model';

@Injectable({ providedIn: 'root' })
export class ProcessRealtimeService {
  private readonly tokenManager = inject(TokenManagerService);
  private readonly events = new Subject<ProcessStatusUpdated>();
  private readonly reconnected = new Subject<void>();
  private readonly versions = new Map<string, number>();
  private connection?: HubConnection;
  private startPromise?: Promise<void>;

  readonly reconnected$ = this.reconnected.asObservable();

  eventsForJob(jobId: string): Observable<ProcessStatusUpdated> {
    return this.events.pipe(filter(event => event.jobId === jobId));
  }

  allEvents(): Observable<ProcessStatusUpdated> {
    return this.events.asObservable();
  }

  connect(): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      return Promise.resolve();
    }
    if (this.startPromise) {
      return this.startPromise;
    }

    if (!this.connection) {
      this.connection = new HubConnectionBuilder()
        .withUrl(environment.realtimeUrl, {
          accessTokenFactory: () => this.tokenManager.getAccessToken('game-api')
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(LogLevel.Warning)
        .build();
      this.connection.on('process-status-updated', (event: ProcessStatusUpdated) => {
        const currentVersion = this.versions.get(event.jobId) ?? -1;
        if (event.version <= currentVersion) {
          return;
        }
        this.versions.set(event.jobId, event.version);
        this.events.next(event);
      });
      this.connection.onreconnected(() => this.reconnected.next());
    }

    this.startPromise = this.connection.start()
      .finally(() => { this.startPromise = undefined; });
    return this.startPromise;
  }

  async stop(): Promise<void> {
    this.startPromise = undefined;
    this.versions.clear();
    if (this.connection && this.connection.state !== HubConnectionState.Disconnected) {
      await this.connection.stop();
    }
  }
}
