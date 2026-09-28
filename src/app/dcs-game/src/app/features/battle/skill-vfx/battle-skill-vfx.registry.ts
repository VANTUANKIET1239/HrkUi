import { Type } from '@angular/core';
import { DarkKnowledgeSceneVfxComponent } from './scene/dark-knowledge-scene-vfx.component';
import { DeadliftSceneVfxComponent } from './scene/deadlift-scene-vfx.component';
import { HeavenlyJudgmentSceneVfxComponent } from './scene/heavenly-judgment-scene-vfx.component';
import { RicardoSceneVfxComponent } from './scene/ricardo-scene-vfx.component';
import { ThanhThaiSceneVfxComponent } from './scene/thanh-thai-scene-vfx.component';
import { HaiLastLaughSceneVfxComponent } from './scene/hai-last-laugh/hai-last-laugh-scene-vfx.component';
import { NghiaPhucPrimeSceneVfxComponent } from './scene/nghia-phuc-prime/nghia-phuc-prime-scene-vfx.component';
import { TrongChuaNoSceneVfxComponent } from './scene/rare-heroes/trong-chua-no-scene-vfx.component';
import { QuangVinhSceneVfxComponent } from './scene/rare-heroes/quang-vinh-scene-vfx.component';
import { NguyenXamLonSceneVfxComponent } from './scene/rare-heroes/nguyen-xam-lon-scene-vfx.component';
import { TienDungXuanSceneVfxComponent } from './scene/rare-heroes/tien-dung-xuan-scene-vfx.component';
import { VanTrongSceneVfxComponent } from './scene/rare-heroes/van-trong-scene-vfx.component';
import { TuongLongSceneVfxComponent } from './scene/rare-heroes/tuong-long-scene-vfx.component';
import { KietBacSiSceneVfxComponent } from './scene/epic-heroes/kiet-bac-si-scene-vfx.component';
import { TruongKietSceneVfxComponent } from './scene/epic-heroes/truong-kiet-scene-vfx.component';
import { TienDungTongDaiSceneVfxComponent } from './scene/epic-heroes/tien-dung-tong-dai-scene-vfx.component';
import { QuocNhanSceneVfxComponent } from './scene/epic-heroes/quoc-nhan-scene-vfx.component';
import { CauVangSceneVfxComponent } from './scene/epic-heroes/cau-vang-scene-vfx.component';
import { SibaSceneVfxComponent } from './scene/siba-thien-than/siba-scene-vfx.component';

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
  DEADLIFT_DIA_CHAN: { sceneComponent: DeadliftSceneVfxComponent },
  THANH_THAI_CRIMSON_BROOM_LIGHTNING: { sceneComponent: ThanhThaiSceneVfxComponent, screenShake: true },
  HAI_LAST_LAUGH: { sceneComponent: HaiLastLaughSceneVfxComponent, screenShake: true },
  PRIME_FORTRESS_CHARGE: { sceneComponent: NghiaPhucPrimeSceneVfxComponent, screenShake: true },
  TRONG_CHUA_NO_THREE_SECONDS: { sceneComponent: TrongChuaNoSceneVfxComponent, screenShake: true },
  QUANG_VINH_THCS_HONOR_BARRIER: { sceneComponent: QuangVinhSceneVfxComponent, screenShake: true },
  NGUYEN_XAM_LON_BOSS_ENTERS: { sceneComponent: NguyenXamLonSceneVfxComponent, screenShake: true },
  TIEN_DUNG_XUAN_TEN_THOUSAND_GLYPHS: { sceneComponent: TienDungXuanSceneVfxComponent },
  VAN_TRONG_DIEN_VANG_CHAIN_LIGHTNING: { sceneComponent: VanTrongSceneVfxComponent },
  TUONG_LONG_CAP_3_CLASS_BELL: { sceneComponent: TuongLongSceneVfxComponent },
  KIET_BAC_SI_EMERGENCY_PROTOCOL: { sceneComponent: KietBacSiSceneVfxComponent },
  TRUONG_KIET_SOUL_KISS: { sceneComponent: TruongKietSceneVfxComponent, screenShake: true },
  TIEN_DUNG_EMERGENCY_CONFERENCE: { sceneComponent: TienDungTongDaiSceneVfxComponent },
  QUOC_NHAN_NIGHT_PHANTOMS: { sceneComponent: QuocNhanSceneVfxComponent, screenShake: true },
  CAU_VANG_CALM_GUARD: { sceneComponent: CauVangSceneVfxComponent },
  SIBA_ANGEL_GENTLE_WING: { sceneComponent: SibaSceneVfxComponent, screenShake: false },
  SIBA_CELESTIAL_PROTECTION: { sceneComponent: SibaSceneVfxComponent, screenShake: false }
};
