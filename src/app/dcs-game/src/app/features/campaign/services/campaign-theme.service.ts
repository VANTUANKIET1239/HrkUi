import { Injectable } from '@angular/core';

export interface CampaignTheme {
  themeCode: string;
  primaryColor: string;
  secondaryColor: string;
  accentGlow: string;
  particleType: 'sparks' | 'dust' | 'rain-neon' | 'sand' | 'celestial-feathers';
  particleColor: string;
  ambientEffect: string;
  bossMarkerStyle: string;
  roadGlow: string;
}

@Injectable({
  providedIn: 'root'
})
export class CampaignThemeService {
  private readonly defaultTheme: CampaignTheme = {
    themeCode: 'default',
    primaryColor: '#f59e0b',
    secondaryColor: '#38bdf8',
    accentGlow: 'rgba(245, 158, 11, 0.45)',
    particleType: 'sparks',
    particleColor: 'rgba(245, 158, 11, 0.6)',
    ambientEffect: 'default',
    bossMarkerStyle: 'default',
    roadGlow: 'rgba(245, 158, 11, 0.6)'
  };

  private readonly themeMap: Record<string, CampaignTheme> = {
    BUG_FOREST: {
      themeCode: 'forest',
      primaryColor: '#22c55e',
      secondaryColor: '#eab308',
      accentGlow: 'rgba(34, 197, 94, 0.45)',
      particleType: 'sparks',
      particleColor: 'rgba(74, 222, 128, 0.65)',
      ambientEffect: 'forest',
      bossMarkerStyle: 'nature',
      roadGlow: 'rgba(34, 197, 94, 0.6)'
    },
    LEGACY_DUNGEON: {
      themeCode: 'dungeon',
      primaryColor: '#a855f7',
      secondaryColor: '#38bdf8',
      accentGlow: 'rgba(168, 85, 247, 0.45)',
      particleType: 'dust',
      particleColor: 'rgba(192, 132, 252, 0.65)',
      ambientEffect: 'crypt',
      bossMarkerStyle: 'ancient',
      roadGlow: 'rgba(168, 85, 247, 0.6)'
    },
    PRODUCTION_CITADEL: {
      themeCode: 'citadel',
      primaryColor: '#ef4444',
      secondaryColor: '#f97316',
      accentGlow: 'rgba(239, 68, 68, 0.45)',
      particleType: 'sparks',
      particleColor: 'rgba(251, 146, 60, 0.65)',
      ambientEffect: 'citadel',
      bossMarkerStyle: 'citadel',
      roadGlow: 'rgba(239, 68, 68, 0.6)'
    },
    NEON_CITY: {
      themeCode: 'neon',
      primaryColor: '#06b6d4',
      secondaryColor: '#ec4899',
      accentGlow: 'rgba(6, 182, 212, 0.55)',
      particleType: 'rain-neon',
      particleColor: 'rgba(56, 189, 248, 0.85)',
      ambientEffect: 'cyberpunk',
      bossMarkerStyle: 'neon-cyber',
      roadGlow: 'rgba(6, 182, 212, 0.7)'
    },
    DEADLINE_DESERT: {
      themeCode: 'desert',
      primaryColor: '#f59e0b',
      secondaryColor: '#dc2626',
      accentGlow: 'rgba(245, 158, 11, 0.55)',
      particleType: 'sand',
      particleColor: 'rgba(245, 158, 11, 0.75)',
      ambientEffect: 'heatwave',
      bossMarkerStyle: 'ancient-desert',
      roadGlow: 'rgba(245, 158, 11, 0.7)'
    },
    MEME_HEAVEN: {
      themeCode: 'heaven',
      primaryColor: '#fbbf24',
      secondaryColor: '#c084fc',
      accentGlow: 'rgba(250, 204, 21, 0.55)',
      particleType: 'celestial-feathers',
      particleColor: 'rgba(253, 224, 71, 0.85)',
      ambientEffect: 'holy-light',
      bossMarkerStyle: 'divine-palace',
      roadGlow: 'rgba(250, 204, 21, 0.75)'
    }
  };

  resolveTheme(mapCode?: string | null): CampaignTheme {
    if (!mapCode) return this.defaultTheme;
    const key = mapCode.trim().toUpperCase();
    return this.themeMap[key] ?? this.defaultTheme;
  }
}
