import { Type } from '@angular/core';
import { DarkKnowledgeSceneVfxComponent } from './scene/dark-knowledge-scene-vfx.component';
import { DeadliftSceneVfxComponent } from './scene/deadlift-scene-vfx.component';
import { HeavenlyJudgmentSceneVfxComponent } from './scene/heavenly-judgment-scene-vfx.component';
import { RicardoSceneVfxComponent } from './scene/ricardo-scene-vfx.component';

export interface BattleSkillVfxDefinition {
  sceneComponent?: Type<unknown>;
  screenShake?: boolean;
}

export const BATTLE_SKILL_VFX_REGISTRY: Readonly<Record<string, BattleSkillVfxDefinition>> = {
  ULTIMATE_SIXPACK: { screenShake: true },
  SWORD_DANCE: { screenShake: true },
  DEPLOY_PROD: { screenShake: true },
  CLOSE_JIRA: { screenShake: true },
  RICARDO_MILOS: { sceneComponent: RicardoSceneVfxComponent, screenShake: true },
  RANDOM_KNOWLEDGE_DROP: { screenShake: true },
  TACTICAL_AIR_STRIKE: { screenShake: true },
  HEAVENLY_JUDGMENT: { sceneComponent: HeavenlyJudgmentSceneVfxComponent, screenShake: true },
  DARK_KNOWLEDGE_SHIELD_CONVERSION: { sceneComponent: DarkKnowledgeSceneVfxComponent, screenShake: true },
  DEADLIFT_DIA_CHAN: { sceneComponent: DeadliftSceneVfxComponent }
};
