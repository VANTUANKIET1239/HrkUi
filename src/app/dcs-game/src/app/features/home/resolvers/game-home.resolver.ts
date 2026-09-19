import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { GameHomeInitializationService, GameHomeInitialData } from '../services/game-home-initialization.service';

export const gameHomeResolver: ResolveFn<GameHomeInitialData> = () => {
  return inject(GameHomeInitializationService).loadHomeData();
};
