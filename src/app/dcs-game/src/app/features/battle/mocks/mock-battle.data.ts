import { Hero } from '../../../core/models/hero.model';
import { BattleLog } from '../../../core/models/battle-log.model';
import { Skill } from '../../../core/models/skill.model';

export const INITIAL_HEROES: Hero[] = [
  // Left Team (Heroes)
  {
    id: 1,
    heroTemplateId: 1,
    name: 'K Cởi Trần',
    avatar: '/assets/images/dcs-game/kiet.png',
    hp: 1000,
    maxHp: 1000,
    mana: 20,
    maxMana: 100,
    attack: 150,
    defense: 80,
    speed: 120,
    position: 1,
    team: 'left',
    statusEffects: ['Sixpack Glow'],
    skills: ['HEAVENLY_JUDGMENT', 'ULTIMATE_SIXPACK'],
    level: 4,
    stars: 5,
    auraTier: 1,
    defaultFacing: 'right',
    starAura: {
      heroTemplateId: 1,
      starLevel: 5,
      auraCode: 'KIET_STAR_5',
      visualKey: 'kiet-red-lightning',
      name: 'Chí Tôn Lôi Thần',
      intensity: 2.2,
      particleLevel: 4,
      primaryColorHex: '#e11d48',
      secondaryColorHex: '#fef08a'
    }
  },
  {
    id: 2,
    heroTemplateId: 2,
    name: 'Nam Deadline',
    avatar: '/assets/images/dcs-game/trg-kiet-covid.png',
    hp: 900,
    maxHp: 900,
    mana: 50,
    maxMana: 100,
    attack: 140,
    defense: 70,
    speed: 115,
    position: 2,
    team: 'left',
    statusEffects: ['Overtime'],
    skills: ['NORMAL_ATTACK', 'HEAVY_SLASH', 'VAX_A_MILLION_SANITZATION'],
    level: 3,
    stars: 4,
    auraTier: 1,
    defaultFacing: 'left',
    starAura: {
      heroTemplateId: 2,
      starLevel: 4,
      auraCode: 'NAM_DEADLINE_STAR_4',
      visualKey: 'nam-deadline-sterile-pulse',
      name: 'Dược Thể Cao Tốc',
      intensity: 1.75,
      particleLevel: 3,
      primaryColorHex: '#0891b2',
      secondaryColorHex: '#ffffff'
    }
  },
  {
    id: 3,
    heroTemplateId: 3,
    name: 'Chuẩn Men',
    avatar: '/assets/images/dcs-game/ricardo-milos.png',
    hp: 1100,
    maxHp: 1100,
    mana: 30,
    maxMana: 100,
    attack: 120,
    defense: 100,
    speed: 100,
    position: 3,
    team: 'left',
    statusEffects: ['Shield'],
    skills: ['CHUAN_MEN_BASIC', 'RICARDO_MILOS'],
    level: 2,
    stars: 3,
    auraTier: 1,
    defaultFacing: 'left',
    starAura: {
      heroTemplateId: 3,
      starLevel: 3,
      auraCode: 'CHUAN_MEN_STAR_3',
      visualKey: 'chuan-men-crimson-rhythm',
      name: 'Xích Huyết Cuồng Vũ',
      intensity: 1.3,
      particleLevel: 2,
      primaryColorHex: '#dc2626',
      secondaryColorHex: '#7e22ce'
    }
  },
  {
    id: 4,
    heroTemplateId: 4,
    name: 'Coder Bảnh',
    avatar: '/assets/images/dcs-game/vantrong-hs.png',
    hp: 850,
    maxHp: 850,
    mana: 80,
    maxMana: 100,
    attack: 160,
    defense: 60,
    speed: 130,
    position: 4,
    team: 'left',
    statusEffects: ['Clean Code'],
    skills: ['NORMAL_ATTACK', 'RANDOM_KNOWLEDGE_DROP', 'REFACTOR_CODE', 'DEPLOY_PROD'],
    level: 2,
    stars: 2,
    auraTier: 1,
    defaultFacing: 'right',
    starAura: {
      heroTemplateId: 4,
      starLevel: 2,
      auraCode: 'CODER_BANH_STAR_2',
      visualKey: 'coder-banh-digital-knowledge',
      name: 'Ký Tự Nhị Phân',
      intensity: 0.85,
      particleLevel: 1,
      primaryColorHex: '#10b981',
      secondaryColorHex: '#06b6d4'
    }
  },
  {
    id: 5,
    heroTemplateId: 5,
    name: 'Tester Đẹp',
    avatar: '/assets/images/dcs-game/nghiaphuc-bongtoi.png',
    hp: 950,
    maxHp: 950,
    mana: 40,
    maxMana: 100,
    attack: 130,
    defense: 90,
    speed: 110,
    position: 5,
    team: 'left',
    statusEffects: ['Bug Radar'],
    skills: ['NORMAL_ATTACK', 'AUTOMATION_TEST', 'DARK_KNOWLEDGE_SHIELD_CONVERSION'],
    level: 1,
    stars: 3,
    auraTier: 1,
    defaultFacing: 'left',
    starAura: {
      heroTemplateId: 5,
      starLevel: 3,
      auraCode: 'TESTER_DEP_STAR_3',
      visualKey: 'tester-dep-obsidian-nebula',
      name: 'Màn Che Tinh Vân',
      intensity: 1.3,
      particleLevel: 2,
      primaryColorHex: '#9333ea',
      secondaryColorHex: '#0f172a'
    }
  },

  // Right Team (Enemies)
  {
    id: 6,
    heroTemplateId: 6,
    name: 'Tướng Long Quân Đội',
    avatar: '/assets/images/dcs-game/tuonglong-quandoi.png',
    hp: 900,
    maxHp: 900,
    mana: 50,
    maxMana: 100,
    attack: 160,
    defense: 85,
    speed: 125,
    position: 1,
    team: 'right',
    statusEffects: [],
    skills: ['NORMAL_ATTACK', 'TACTICAL_AIR_STRIKE'],
    level: 4,
    stars: 4,
    auraTier: 1,
    defaultFacing: 'left',
    starAura: {
      heroTemplateId: 6,
      starLevel: 4,
      auraCode: 'TUONG_LONG_STAR_4',
      visualKey: 'tuong-long-scorched-command',
      name: 'Quân Lệnh Thiết Huyết',
      intensity: 1.75,
      particleLevel: 3,
      primaryColorHex: '#f97316',
      secondaryColorHex: '#dc2626'
    }
  },
  {
    id: 7,
    heroTemplateId: 7,
    name: 'PM Hối Hả',
    avatar: '/assets/images/dcs-game/quangvinh-barber.png',
    hp: 800,
    maxHp: 800,
    mana: 30,
    maxMana: 100,
    attack: 130,
    defense: 80,
    speed: 112,
    position: 2,
    team: 'right',
    statusEffects: ['ASAP'],
    skills: ['NORMAL_ATTACK', 'DOI_NGOI_DAU_DOC'],
    level: 3,
    stars: 5,
    auraTier: 1,
    defaultFacing: 'right',
    starAura: {
      heroTemplateId: 7,
      starLevel: 5,
      auraCode: 'PM_HOI_HA_STAR_5',
      visualKey: 'pm-hoi-ha-spectral-grooming',
      name: 'Đại Sư Tạo Mẫu',
      intensity: 2.2,
      particleLevel: 4,
      primaryColorHex: '#2dd4bf',
      secondaryColorHex: '#c4b5fd'
    }
  },
  {
    id: 8,
    heroTemplateId: 8,
    name: 'QA Kỹ Tính',
    avatar: '/assets/images/dcs-game/vantrong-cobac.png',
    hp: 850,
    maxHp: 850,
    mana: 40,
    maxMana: 100,
    attack: 120,
    defense: 110,
    speed: 95,
    position: 3,
    team: 'right',
    statusEffects: ['Edge Case'],
    skills: ['NORMAL_ATTACK', 'FATAL_ALL_IN_DIRECTIVE'],
    level: 2,
    stars: 3,
    auraTier: 1,
    defaultFacing: 'left',
    starAura: {
      heroTemplateId: 8,
      starLevel: 3,
      auraCode: 'QA_KY_TINH_STAR_3',
      visualKey: 'qa-ky-tinh-vicious-debt',
      name: 'Vòng Xoáy Nợ Nần',
      intensity: 1.3,
      particleLevel: 2,
      primaryColorHex: '#dc2626',
      secondaryColorHex: '#ca8a04'
    }
  },
  {
    id: 9,
    heroTemplateId: 9,
    name: 'Kiet Noel',
    avatar: '/assets/images/dcs-game/TruongKiet-Noel.png',
    hp: 900,
    maxHp: 900,
    mana: 60,
    maxMana: 100,
    attack: 140,
    defense: 75,
    speed: 105,
    position: 4,
    team: 'right',
    statusEffects: ['Feedback Loop'],
    skills: ['BASIC_RANDOM_HEAL', 'WINTER_NIGHT_BLESSINGS'],
    level: 2,
    stars: 4,
    auraTier: 1,
    defaultFacing: 'right',
    starAura: {
      heroTemplateId: 9,
      starLevel: 4,
      auraCode: 'KIET_NOEL_STAR_4',
      visualKey: 'kiet-noel-dark-blizzard',
      name: 'Cực Quang Bắc Cực',
      intensity: 1.75,
      particleLevel: 3,
      primaryColorHex: '#38bdf8',
      secondaryColorHex: '#a855f7'
    }
  },
  {
    id: 10,
    heroTemplateId: 10,
    name: 'Hoàng Nguyên',
    avatar: '/assets/images/dcs-game/HoangNguyen-Gymer.png',
    hp: 1000,
    maxHp: 1000,
    mana: 100,
    maxMana: 100,
    attack: 170,
    defense: 85,
    speed: 90,
    position: 5,
    team: 'right',
    statusEffects: ['Immortal Bug', 'Rep: 9'],
    skills: ['NORMAL_ATTACK', 'DEADLIFT_DIA_CHAN'],
    level: 1,
    stars: 2,
    auraTier: 1,
    defaultFacing: 'left',
    starAura: {
      heroTemplateId: 10,
      starLevel: 2,
      auraCode: 'HOANG_NGUYEN_STAR_2',
      visualKey: 'hoang-nguyen-heavy-iron',
      name: 'Trọng Lực Thô Sơ',
      intensity: 0.85,
      particleLevel: 1,
      primaryColorHex: '#eab308',
      secondaryColorHex: '#64748b'
    }
  },
  {
    id: 11,
    heroTemplateId: 11,
    heroCode: 'NGHIA_PHUC_PRIME',
    name: 'Nghĩa Phục Prime',
    avatar: '/assets/images/dcs-game/nghia-phuc-prime.png',
    hp: 1800,
    maxHp: 1800,
    mana: 30,
    maxMana: 100,
    attack: 95,
    defense: 220,
    speed: 85,
    magicResistance: 160,
    position: 1,
    team: 'left',
    statusEffects: [],
    skills: ['PRIME_SHIELD_WARRANTY', 'PRIME_FORTRESS_CHARGE'],
    level: 4,
    stars: 5,
    auraTier: 1,
    defaultFacing: 'right',
    starAura: {
      heroTemplateId: 11,
      starLevel: 5,
      auraCode: 'PRIME_STAR_5',
      visualKey: 'prime-fortress-aura',
      name: 'Thành Trì Prime Vĩnh Cửu',
      intensity: 2.5,
      particleLevel: 5,
      primaryColorHex: '#00e5ff',
      secondaryColorHex: '#0077ff'
    }
  }
];

export const MOCK_BATTLE_LOGS: BattleLog[] = [
  {
    turn: 1,
    actorId: 6,
    targetId: 2,
    skillId: 'TACTICAL_AIR_STRIKE',
    damage: 180,
    isCrit: false
  },
  {
    turn: 2,
    actorId: 10,
    targetId: 1,
    skillId: 'DEADLIFT_DIA_CHAN',
    damage: 120,
    isCrit: false

  },
  {
    turn: 3,
    actorId: 5,
    targetId: 7,
    skillId: 'DARK_KNOWLEDGE_SHIELD_CONVERSION',
    damage: 250,
    isCrit: false
  },
  {
    turn: 4,
    actorId: 8,
    targetId: 3,
    skillId: 'FATAL_ALL_IN_DIRECTIVE',
    damage: 300,
    isCrit: false

  },
  {
    turn: 5,
    actorId: 1,
    targetId: 6,
    skillId: 'ULTIMATE_SIXPACK',
    damage: 600,
    isCrit: true
  },
  {
    turn: 6,
    actorId: 3,
    targetId: 7,
    skillId: 'RICARDO_MILOS',
    // Keep PM Hối Hả alive after Heavenly Judgment at turn 7 so he can
    // legitimately take his scheduled turn 9.
    damage: 300,
    isCrit: true
  },
  {
    turn: 7,
    actorId: 1,
    targetId: 6,
    skillId: 'HEAVENLY_JUDGMENT',
    damage: 150,
    isCrit: false
  },
  {
    turn: 8,
    actorId: 4,
    targetId: 8,
    skillId: 'RANDOM_KNOWLEDGE_DROP',
    damage: 300,
    isCrit: false
  },
  {
    turn: 9,
    actorId: 7,
    targetId: 2,
    skillId: 'DOI_NGOI_DAU_DOC',
    damage: 220,
    isCrit: false
  },
  {
    turn: 10,
    actorId: 4,
    targetId: 9,
    skillId: 'NORMAL_ATTACK',
    damage: 200,
    isCrit: false
  },
  {
    turn: 11,
    actorId: 5,
    targetId: 8,
    skillId: 'AUTOMATION_TEST',
    damage: 200,
    isCrit: false
  },
  {
    turn: 12,
    actorId: 3,
    targetId: 8,
    skillId: 'SLASH',
    damage: 80,
    isCrit: false
  },
  {
    turn: 13,
    actorId: 9,
    targetId: 9,
    skillId: 'WINTER_NIGHT_BLESSINGS',
    damage: 0,
    isCrit: false
  },
  {
    turn: 14,
    actorId: 4,
    targetId: 9,
    skillId: 'DEPLOY_PROD',
    damage: 600,
    isCrit: true
  },
  {
    turn: 15,
    actorId: 8,
    targetId: 1,
    skillId: 'FATAL_ALL_IN_DIRECTIVE',
    damage: 300,
    isCrit: false
  },
  {
    turn: 16,
    actorId: 1,
    targetId: 10,
    skillId: 'HEAVENLY_JUDGMENT',
    damage: 1000,
    isCrit: true
  }
];

export const SKILL_LIST: Record<string, Skill> = {
  BASIC_RANDOM_HEAL: {
    id: 'BASIC_RANDOM_HEAL',
    name: 'Hồi Máu Cơ Bản',
    skillTypeCode: 'NORMAL',
    triggerCode: 'ON_ATTACK',
    energyCost: 0,
    cost: 0,
    costType: 'NONE',
    category: 'basic',
    color: '#22c55e',
    type: 'magical',
    description: 'Hồi phục cho một đồng minh còn sống được chọn ngẫu nhiên.',
    damageMultiplier: 0,
    targetType: 'friendly_random',
    effects: [
      {
        effectTypeCode: 'HEAL',
        effectTypeName: 'Hồi phục sinh lực',
        targetTypeCode: 'ALLY_RANDOM',
        targetTypeName: '1 đồng minh ngẫu nhiên',
        targetSide: 'ALLY',
        selectionRule: 'RANDOM',
        scalings: [{ attributeTypeCode: 'HP', attributeTypeName: 'Máu tối đa', coefficient: 0.2, flatValue: 0 }]
      }
    ]
  },
  NORMAL_ATTACK: {
    id: 'NORMAL_ATTACK',
    name: 'Đánh Thường',
    skillTypeCode: 'NORMAL',
    triggerCode: 'ON_ATTACK',
    energyCost: 0,
    cost: 0,
    costType: 'MP',
    category: 'basic',
    color: '#aaaaaa',
    type: 'physical',
    description: 'Tấn công vật lý cơ bản gây sát thương chuẩn.',
    damageMultiplier: 1.0,
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương vật lý',
        targetTypeCode: 'ENEMY_SINGLE',
        targetTypeName: 'Đơn mục tiêu',
        damageSchoolCode: 'PHYSICAL',
        scalings: [{ attributeTypeCode: 'ATK', attributeTypeName: 'Công', coefficient: 1.0, flatValue: 0 }]
      }
    ]
  },
  FIREBALL: {
    id: 'FIREBALL',
    name: 'Hỏa Cầu Sếp Phạt',
    skillTypeCode: 'ENERGY',
    triggerCode: 'MANUAL_ENERGY_FULL',
    energyCost: 100,
    cost: 100,
    costType: 'MP',
    category: 'rage',
    color: '#ff3333',
    type: 'magical',
    description: 'Sếp ném hỏa cầu thiêu rụi tinh thần coder.',
    damageMultiplier: 1.5,
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương phép',
        targetTypeCode: 'ENEMY_SINGLE',
        damageSchoolCode: 'MAGIC',
        scalings: [{ attributeTypeCode: 'MAGIC_DAMAGE', attributeTypeName: 'Sát thương phép', coefficient: 1.5, flatValue: 0 }]
      },
      {
        effectTypeCode: 'BURN',
        effectTypeName: 'Thiêu đốt',
        targetTypeCode: 'ENEMY_SINGLE',
        durationTurns: 2,
        baseValue: 50
      }
    ]
  },
  HEAVY_SLASH: {
    id: 'HEAVY_SLASH',
    name: 'Chém Deadline',
    skillTypeCode: 'ENERGY',
    triggerCode: 'MANUAL_ENERGY_FULL',
    energyCost: 100,
    cost: 100,
    costType: 'MP',
    category: 'rage',
    color: '#ffaa00',
    type: 'physical',
    description: 'Vung kiếm chém mạnh làm giảm thời gian deadline.',
    damageMultiplier: 1.4,
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương vật lý',
        targetTypeCode: 'ENEMY_SINGLE',
        damageSchoolCode: 'PHYSICAL',
        scalings: [{ attributeTypeCode: 'ATK', attributeTypeName: 'Công', coefficient: 1.4, flatValue: 0 }]
      }
    ]
  },
  LIGHTNING_STRIKE: {
    id: 'LIGHTNING_STRIKE',
    name: 'Sét Đánh Khẩn Cấp',
    skillTypeCode: 'ENERGY',
    triggerCode: 'MANUAL_ENERGY_FULL',
    energyCost: 100,
    cost: 100,
    costType: 'MP',
    category: 'thunder',
    color: '#33ccff',
    type: 'magical',
    description: 'PM triệu hồi sét đánh thẳng vào máy chủ.',
    damageMultiplier: 1.4,
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương phép',
        targetTypeCode: 'ENEMY_SINGLE',
        damageSchoolCode: 'MAGIC',
        scalings: [{ attributeTypeCode: 'MAGIC_DAMAGE', attributeTypeName: 'Sát thương phép', coefficient: 1.4, flatValue: 0 }]
      },
      {
        effectTypeCode: 'STUN',
        effectTypeName: 'Choáng',
        targetTypeCode: 'ENEMY_SINGLE',
        durationTurns: 1,
        chancePercent: 30
      }
    ]
  },
  ULTIMATE_SIXPACK: {
    id: 'ULTIMATE_SIXPACK',
    name: 'Nộ Long Sáu Múi',
    skillTypeCode: 'ENERGY',
    triggerCode: 'MANUAL_ENERGY_FULL',
    energyCost: 100,
    cost: 100,
    costType: 'MP',
    category: 'ultimate',
    color: '#ff00aa',
    type: 'ultimate',
    description: 'K cởi trần gồng mình hóa thần công phá địch.',
    damageMultiplier: 2.5,
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương vật lý',
        targetTypeCode: 'ENEMY_SINGLE',
        damageSchoolCode: 'PHYSICAL',
        scalings: [{ attributeTypeCode: 'ATK', attributeTypeName: 'Công', coefficient: 2.5, flatValue: 0 }]
      },
      {
        effectTypeCode: 'STAT_BUFF',
        effectTypeName: 'Tăng Công',
        targetTypeCode: 'SELF',
        durationTurns: 2,
        statModifiers: [{ attributeTypeCode: 'ATK', valueType: 'PERCENT', value: 20 }]
      }
    ]
  },
  CRITICAL_BUG: {
    id: 'CRITICAL_BUG',
    name: 'Bug Nghiêm Trọng',
    skillTypeCode: 'ENERGY',
    triggerCode: 'MANUAL_ENERGY_FULL',
    energyCost: 100,
    cost: 100,
    costType: 'MP',
    category: 'rage',
    color: '#cc33ff',
    type: 'magical',
    description: 'QA phát hiện bug critical chặn đứng tiến trình.',
    damageMultiplier: 1.3,
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương phép',
        targetTypeCode: 'ENEMY_SINGLE',
        damageSchoolCode: 'MAGIC',
        scalings: [{ attributeTypeCode: 'MAGIC_DAMAGE', attributeTypeName: 'Sát thương phép', coefficient: 1.3, flatValue: 0 }]
      },
      {
        effectTypeCode: 'STAT_DEBUFF',
        effectTypeName: 'Giảm Giáp',
        targetTypeCode: 'ENEMY_SINGLE',
        durationTurns: 2,
        statModifiers: [{ attributeTypeCode: 'DEF', valueType: 'PERCENT', value: -20 }]
      }
    ]
  },
  SWORD_DANCE: {
    id: 'SWORD_DANCE',
    name: 'Vũ Điệu Chuẩn Men',
    skillTypeCode: 'ENERGY',
    triggerCode: 'MANUAL_ENERGY_FULL',
    energyCost: 100,
    cost: 100,
    costType: 'MP',
    category: 'ultimate',
    color: '#33ffaa',
    type: 'ultimate',
    description: 'Tuyệt chiêu kiếm vũ chuẩn men chém nát deadline.',
    damageMultiplier: 2.2,
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương vật lý',
        targetTypeCode: 'ENEMY_SINGLE',
        damageSchoolCode: 'PHYSICAL',
        scalings: [{ attributeTypeCode: 'ATK', attributeTypeName: 'Công', coefficient: 2.2, flatValue: 0 }]
      }
    ]
  },
  CHANGE_REQUIREMENT: {
    id: 'CHANGE_REQUIREMENT',
    name: 'Đổi Yêu Cầu Gấp',
    skillTypeCode: 'ENERGY',
    triggerCode: 'MANUAL_ENERGY_FULL',
    energyCost: 100,
    cost: 100,
    costType: 'MP',
    category: 'rage',
    color: '#ff33cc',
    type: 'magical',
    description: 'Client đổi yêu cầu phút chót gây sát thương tinh thần cực lớn.',
    damageMultiplier: 1.5,
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương phép',
        targetTypeCode: 'ENEMY_SINGLE',
        damageSchoolCode: 'MAGIC',
        scalings: [{ attributeTypeCode: 'MAGIC_DAMAGE', attributeTypeName: 'Sát thương phép', coefficient: 1.5, flatValue: 0 }]
      },
      {
        effectTypeCode: 'STAT_DEBUFF',
        effectTypeName: 'Giảm Tốc Độ',
        targetTypeCode: 'ENEMY_SINGLE',
        durationTurns: 2,
        statModifiers: [{ attributeTypeCode: 'SPD', valueType: 'PERCENT', value: -20 }]
      }
    ]
  },
  REFACTOR_CODE: {
    id: 'REFACTOR_CODE',
    name: 'Tái Cấu Trúc Đẹp',
    skillTypeCode: 'ENERGY',
    triggerCode: 'MANUAL_ENERGY_FULL',
    energyCost: 100,
    cost: 100,
    costType: 'MP',
    category: 'thunder',
    color: '#00aaff',
    type: 'magical',
    description: 'Tái cấu trúc code mượt mà tối ưu hóa hệ thống.',
    damageMultiplier: 1.5,
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương phép',
        targetTypeCode: 'ENEMY_SINGLE',
        damageSchoolCode: 'MAGIC',
        scalings: [{ attributeTypeCode: 'MAGIC_DAMAGE', attributeTypeName: 'Sát thương phép', coefficient: 1.5, flatValue: 0 }]
      },
      {
        effectTypeCode: 'STAT_BUFF',
        effectTypeName: 'Tăng Phép',
        targetTypeCode: 'SELF',
        durationTurns: 2,
        statModifiers: [{ attributeTypeCode: 'MAGIC_DAMAGE', valueType: 'PERCENT', value: 25 }]
      }
    ]
  },
  NULL_POINTER: {
    id: 'NULL_POINTER',
    name: 'Lỗi Con Trỏ Null',
    skillTypeCode: 'ENERGY',
    triggerCode: 'MANUAL_ENERGY_FULL',
    energyCost: 100,
    cost: 100,
    costType: 'MP',
    category: 'thunder',
    color: '#ff3300',
    type: 'magical',
    description: 'Gây lỗi Null Pointer làm crash ứng dụng.',
    damageMultiplier: 1.3,
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương phép',
        targetTypeCode: 'ENEMY_SINGLE',
        damageSchoolCode: 'MAGIC',
        scalings: [{ attributeTypeCode: 'MAGIC_DAMAGE', attributeTypeName: 'Sát thương phép', coefficient: 1.3, flatValue: 0 }]
      },
      {
        effectTypeCode: 'SILENCE',
        effectTypeName: 'Câm Lặng',
        targetTypeCode: 'ENEMY_SINGLE',
        durationTurns: 2,
        chancePercent: 50
      }
    ]
  },
  AUTOMATION_TEST: {
    id: 'AUTOMATION_TEST',
    name: 'Test Tự Động',
    skillTypeCode: 'NORMAL',
    triggerCode: 'ON_ATTACK',
    energyCost: 0,
    cost: 0,
    costType: 'MP',
    category: 'basic',
    color: '#33ff33',
    type: 'physical',
    description: 'Tester tự động hóa kiểm thử liên tục.',
    damageMultiplier: 1.2,
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương vật lý',
        targetTypeCode: 'ENEMY_SINGLE',
        damageSchoolCode: 'PHYSICAL',
        scalings: [{ attributeTypeCode: 'ATK', attributeTypeName: 'Công', coefficient: 1.2, flatValue: 0 }]
      }
    ]
  },
  SLASH: {
    id: 'SLASH',
    name: 'Chém Thường',
    skillTypeCode: 'NORMAL',
    triggerCode: 'ON_ATTACK',
    energyCost: 0,
    cost: 0,
    costType: 'MP',
    category: 'basic',
    color: '#dddddd',
    type: 'physical',
    description: 'Tấn công chém thường cơ bản.',
    damageMultiplier: 1.0,
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương vật lý',
        targetTypeCode: 'ENEMY_SINGLE',
        damageSchoolCode: 'PHYSICAL',
        scalings: [{ attributeTypeCode: 'ATK', attributeTypeName: 'Công', coefficient: 1.0, flatValue: 0 }]
      }
    ]
  },
  COMPLAIN: {
    id: 'COMPLAIN',
    name: 'Phàn Nàn Giờ Chót',
    skillTypeCode: 'ENERGY',
    triggerCode: 'MANUAL_ENERGY_FULL',
    energyCost: 100,
    cost: 100,
    costType: 'MP',
    category: 'rage',
    color: '#ff6600',
    type: 'magical',
    description: 'Client phàn nàn về thiết kế làm rối loạn đội hình.',
    damageMultiplier: 1.1,
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương phép',
        targetTypeCode: 'ENEMY_SINGLE',
        damageSchoolCode: 'MAGIC',
        scalings: [{ attributeTypeCode: 'MAGIC_DAMAGE', attributeTypeName: 'Sát thương phép', coefficient: 1.1, flatValue: 0 }]
      },
      {
        effectTypeCode: 'STAT_DEBUFF',
        effectTypeName: 'Giảm Công',
        targetTypeCode: 'ENEMY_SINGLE',
        durationTurns: 2,
        statModifiers: [{ attributeTypeCode: 'ATK', valueType: 'PERCENT', value: -15 }]
      }
    ]
  },
  DEPLOY_PROD: {
    id: 'DEPLOY_PROD',
    name: 'Lên Prod Bảnh Tỏn',
    skillTypeCode: 'ENERGY',
    triggerCode: 'MANUAL_ENERGY_FULL',
    energyCost: 100,
    cost: 100,
    costType: 'MP',
    category: 'ultimate',
    color: '#ccff33',
    type: 'ultimate',
    description: 'Coder Bảnh đẩy code thẳng lên Production không cần test.',
    damageMultiplier: 2.5,
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương vật lý',
        targetTypeCode: 'ENEMY_SINGLE',
        damageSchoolCode: 'PHYSICAL',
        scalings: [{ attributeTypeCode: 'ATK', attributeTypeName: 'Công', coefficient: 2.5, flatValue: 0 }]
      }
    ]
  },
  STACK_OVERFLOW: {
    id: 'STACK_OVERFLOW',
    name: 'Tràn Bộ Đệm',
    skillTypeCode: 'ENERGY',
    triggerCode: 'MANUAL_ENERGY_FULL',
    energyCost: 100,
    cost: 100,
    costType: 'MP',
    category: 'thunder',
    color: '#ff0000',
    type: 'magical',
    description: 'Tràn bộ đệm làm sập hệ thống phòng ngự.',
    damageMultiplier: 1.2,
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương phép',
        targetTypeCode: 'ENEMY_SINGLE',
        damageSchoolCode: 'MAGIC',
        scalings: [{ attributeTypeCode: 'MAGIC_DAMAGE', attributeTypeName: 'Sát thương phép', coefficient: 1.2, flatValue: 0 }]
      },
      {
        effectTypeCode: 'STAT_DEBUFF',
        effectTypeName: 'Giảm Giáp',
        targetTypeCode: 'ENEMY_SINGLE',
        durationTurns: 2,
        statModifiers: [{ attributeTypeCode: 'DEF', valueType: 'PERCENT', value: -30 }]
      }
    ]
  },
  CLOSE_JIRA: {
    id: 'CLOSE_JIRA',
    name: 'Đóng Task Jira!',
    skillTypeCode: 'ENERGY',
    triggerCode: 'MANUAL_ENERGY_FULL',
    energyCost: 100,
    cost: 100,
    costType: 'MP',
    category: 'ultimate',
    color: '#00ffaa',
    type: 'ultimate',
    description: 'K cởi trần đóng task Jira kết thúc dự án thành công.',
    damageMultiplier: 3.0,
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương chuẩn',
        targetTypeCode: 'ENEMY_SINGLE',
        damageSchoolCode: 'TRUE',
        scalings: [{ attributeTypeCode: 'ATK', attributeTypeName: 'Công', coefficient: 3.0, flatValue: 0 }]
      }
    ]
  },
  HEAVENLY_JUDGMENT: {
    id: 'HEAVENLY_JUDGMENT',
    name: 'Phán Quyết Sấm Sét Cởi Trần',
    skillTypeCode: 'ENERGY',
    triggerCode: 'MANUAL_ENERGY_FULL',
    energyCost: 100,
    cost: 100,
    costType: 'MP',
    category: 'heavenly',
    color: '#ff0055',
    type: 'ultimate',
    description: 'Tuyệt kỹ sấm sét hủy diệt toàn bộ kẻ địch trên chiến trường.',
    damageMultiplier: 3.5,
    isAoE: true,
    targetType: 'all',
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương phép diện rộng',
        targetTypeCode: 'ENEMY_ALL',
        damageSchoolCode: 'MAGIC',
        scalings: [{ attributeTypeCode: 'MAGIC_DAMAGE', attributeTypeName: 'Sát thương phép', coefficient: 3.5, flatValue: 0 }]
      }
    ]
  },
  VAX_A_MILLION_SANITZATION: {
    id: 'VAX_A_MILLION_SANITZATION',
    name: 'Pháo Quang Phổ Tiệt Trùng',
    skillTypeCode: 'ENERGY',
    triggerCode: 'MANUAL_ENERGY_FULL',
    energyCost: 100,
    cost: 100,
    costType: 'MP',
    category: 'ultimate',
    color: '#00ffcc',
    type: 'ultimate',
    description: 'Nam Deadline rút ống tiêm Vax-A-Million bắn luồng laser khử khuẩn cực mạnh quét sạch toàn bộ kẻ địch trên đường thẳng đối diện.',
    damageMultiplier: 2.8,
    targetType: 'linear',
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương laser phép',
        targetTypeCode: 'ENEMY_ALL',
        damageSchoolCode: 'MAGIC',
        scalings: [{ attributeTypeCode: 'MAGIC_DAMAGE', attributeTypeName: 'Sát thương phép', coefficient: 2.8, flatValue: 0 }]
      }
    ]
  },
  CHUAN_MEN_BASIC: {
    id: 'CHUAN_MEN_BASIC',
    name: 'Đấm Chuẩn Men',
    skillTypeCode: 'NORMAL',
    energyCost: 0,
    cost: 0,
    costType: 'MP',
    category: 'basic',
    color: '#ff0033',
    type: 'basic',
    description: 'Chuẩn Men tấn công một mục tiêu, gây 110% ATK sát thương vật lý.',
    damageMultiplier: 1.1,
    targetType: 'single',
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương vật lý',
        targetTypeCode: 'ENEMY_SINGLE',
        damageSchoolCode: 'PHYSICAL',
        scalings: [{ attributeTypeCode: 'ATK', attributeTypeName: 'Công', coefficient: 1.1, flatValue: 0 }]
      }
    ]
  },
  RICARDO_MILOS: {
    id: 'RICARDO_MILOS',
    name: 'Ricardo Milos!',
    skillTypeCode: 'ENERGY',
    triggerCode: 'MANUAL_ENERGY_FULL',
    energyCost: 100,
    cost: 100,
    costType: 'MP',
    category: 'ultimate',
    color: '#ff0033',
    type: 'ultimate',
    description: 'Chuẩn Men hóa thân thành Ricardo Milos thực hiện điệu nhảy Crimson quyến rũ gây chấn động mạnh lên mục tiêu hàng sau cùng làn.',
    damageMultiplier: 2.5,
    targetType: 'same_lane_back_row',
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương vật lý',
        targetTypeCode: 'ENEMY_SAME_LANE_BACK_ROW',
        damageSchoolCode: 'PHYSICAL',
        scalings: [{ attributeTypeCode: 'ATK', attributeTypeName: 'Công', coefficient: 2.5, flatValue: 0 }]
      },
      {
        effectTypeCode: 'STUN',
        effectTypeName: 'Choáng',
        targetTypeCode: 'ENEMY_SAME_LANE_BACK_ROW',
        durationTurns: 1,
        chancePercent: 100
      }
    ]
  },
  RANDOM_KNOWLEDGE_DROP: {
    id: 'RANDOM_KNOWLEDGE_DROP',
    name: 'Kiến Thức Sang Chấn',
    skillTypeCode: 'ENERGY',
    triggerCode: 'MANUAL_ENERGY_FULL',
    energyCost: 100,
    cost: 100,
    costType: 'MP',
    category: 'ultimate',
    color: '#00d9ff',
    type: 'ultimate',
    description: 'Coder Bảnh triệu hồi cuốn sách giáo khoa khổng lồ từ trên trời giáng xuống đầu một kẻ địch ngẫu nhiên.',
    damageMultiplier: 2.6,
    targetType: 'random',
    phase2Duration: 1500,
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương phép',
        targetTypeCode: 'ENEMY_RANDOM',
        damageSchoolCode: 'MAGIC',
        scalings: [{ attributeTypeCode: 'MAGIC_DAMAGE', attributeTypeName: 'Sát thương phép', coefficient: 2.6, flatValue: 0 }]
      },
      {
        effectTypeCode: 'STUN',
        effectTypeName: 'Choáng',
        targetTypeCode: 'ENEMY_RANDOM',
        durationTurns: 1,
        chancePercent: 80
      }
    ]
  },
  DARK_KNOWLEDGE_SHIELD_CONVERSION: {
    id: 'DARK_KNOWLEDGE_SHIELD_CONVERSION',
    name: 'Giáp Hư Không',
    skillTypeCode: 'ENERGY',
    triggerCode: 'MANUAL_ENERGY_FULL',
    energyCost: 100,
    cost: 100,
    costType: 'MP',
    category: 'ultimate',
    color: '#a855f7',
    type: 'magical',
    description: 'Nghĩa Phúc triệu hồi sách ma thuật hắc ám khổng lồ đè bẹp toàn bộ kẻ địch, hấp thụ 100% sát thương gây ra để tạo thành Giáp Bóng Tối bảo vệ bản thân.',
    damageMultiplier: 1.4,
    targetType: 'all',
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương phép diện rộng',
        targetTypeCode: 'ENEMY_ALL',
        damageSchoolCode: 'MAGIC',
        scalings: [{ attributeTypeCode: 'MAGIC_DAMAGE', attributeTypeName: 'Sát thương phép', coefficient: 1.4, flatValue: 0 }]
      },
      {
        effectTypeCode: 'SHIELD',
        effectTypeName: 'Tạo Giáp Hư Không',
        targetTypeCode: 'SELF',
        durationTurns: 2,
        scalings: [{ attributeTypeCode: 'MAGIC_DAMAGE', attributeTypeName: 'Sát thương phép', coefficient: 0.8, flatValue: 0 }]
      }
    ]
  },
  TACTICAL_AIR_STRIKE: {
    id: 'TACTICAL_AIR_STRIKE',
    name: 'Oanh Tạc Hàng Sau',
    skillTypeCode: 'ENERGY',
    triggerCode: 'MANUAL_ENERGY_FULL',
    energyCost: 100,
    cost: 100,
    costType: 'MP',
    category: 'ultimate',
    color: '#fbbf24',
    type: 'ultimate',
    description: 'Tướng Long kích hoạt radar cổ tay kêu gọi 3 tên lửa hành trình oanh tạc toàn bộ hàng sau kẻ địch, gây sát thương trung bình và Đánh Dấu mục tiêu.',
    damageMultiplier: 2.0,
    targetType: 'back_row',
    phase2Duration: 1500,
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương vật lý hàng sau',
        targetTypeCode: 'ENEMY_BACK_ROW',
        damageSchoolCode: 'PHYSICAL',
        scalings: [{ attributeTypeCode: 'ATK', attributeTypeName: 'Công', coefficient: 2.0, flatValue: 0 }]
      },
      {
        effectTypeCode: 'MARK',
        effectTypeName: 'Đánh Dấu',
        targetTypeCode: 'ENEMY_BACK_ROW',
        durationTurns: 2
      }
    ]
  },
  DOI_NGOI_DAU_DOC: {
    id: 'DOI_NGOI_DAU_DOC',
    name: 'Đổi Ngôi Đầu Độc',
    skillTypeCode: 'ENERGY',
    triggerCode: 'MANUAL_ENERGY_FULL',
    energyCost: 100,
    cost: 100,
    costType: 'MP',
    category: 'ultimate',
    color: '#d97706',
    type: 'magical',
    description: 'Vinh Barber hoán đổi vị trí của 2 kẻ địch (1 hàng trước, 1 hàng sau) và giảm 15% tốc độ của chúng.',
    damageMultiplier: 1.0,
    targetType: 'front_and_back',
    phase2Duration: 1400,
    effects: [
      {
        effectTypeCode: 'POSITION_SWAP',
        effectTypeName: 'Đổi Ngôi',
        targetTypeCode: 'ENEMY_FRONT_ROW'
      },
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương phép',
        targetTypeCode: 'ENEMY_FRONT_ROW',
        damageSchoolCode: 'MAGIC',
        scalings: [{ attributeTypeCode: 'MAGIC_DAMAGE', attributeTypeName: 'Sát thương phép', coefficient: 1.0, flatValue: 0 }]
      },
      {
        effectTypeCode: 'STAT_DEBUFF',
        effectTypeName: 'Giảm Tốc Độ',
        targetTypeCode: 'ENEMY_FRONT_ROW',
        durationTurns: 2,
        statModifiers: [{ attributeTypeCode: 'SPD', valueType: 'PERCENT', value: -15 }]
      }
    ]
  },
  FATAL_ALL_IN_DIRECTIVE: {
    id: 'FATAL_ALL_IN_DIRECTIVE',
    name: 'Lệnh All-In Hủy Diệt',
    skillTypeCode: 'ENERGY',
    triggerCode: 'MANUAL_ENERGY_FULL',
    energyCost: 100,
    cost: 100,
    costType: 'MP',
    category: 'ultimate',
    color: '#ff0033',
    type: 'ultimate',
    description: 'Văn Trọng cược 50% HP hiện tại tấn công 4 địch ngẫu nhiên. Hạ gục địch kích hoạt Jackpot hồi 100% HP và tăng 50% Công. Thất bại bị Phá Sản giảm 50% Thủ và câm lặng trong 2 lượt.',
    damageMultiplier: 2.8,
    targetType: 'random_4',
    phase1Duration: 1500,
    phase2Duration: 2200,
    phase3Duration: 1200,
    effects: [
      {
        effectTypeCode: 'HP_SACRIFICE',
        effectTypeName: 'Hiến tế 50% HP',
        targetTypeCode: 'SELF',
        baseValue: 50
      },
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương vật lý 4 mục tiêu',
        targetTypeCode: 'ENEMY_RANDOM_4',
        damageSchoolCode: 'PHYSICAL',
        scalings: [{ attributeTypeCode: 'ATK', attributeTypeName: 'Công', coefficient: 2.8, flatValue: 0 }]
      },
      {
        effectTypeCode: 'STAT_DEBUFF',
        effectTypeName: 'Phá Sản (Giảm 50% Thủ)',
        targetTypeCode: 'SELF',
        durationTurns: 2,
        statModifiers: [{ attributeTypeCode: 'DEF', valueType: 'PERCENT', value: -50 }]
      },
      {
        effectTypeCode: 'SILENCE',
        effectTypeName: 'Câm Lặng',
        targetTypeCode: 'SELF',
        durationTurns: 2
      }
    ]
  },
  WINTER_NIGHT_BLESSINGS: {
    id: 'WINTER_NIGHT_BLESSINGS',
    name: 'Quà Tặng Đêm Đông',
    skillTypeCode: 'ENERGY',
    triggerCode: 'MANUAL_ENERGY_FULL',
    energyCost: 100,
    cost: 100,
    costType: 'MP',
    category: 'ultimate',
    color: '#00ff44',
    type: 'ultimate',
    description: 'Noel quăng bao quà hồi phục 30% HP tối đa cho tất cả đồng đội, bảo vệ 2 đồng minh ngẫu nhiên bằng Quà Bảo Kê (giảm 50% sát thương gánh chịu và chuyển hướng sang Noel) và tăng cho Noel khả năng giảm 40% sát thương trong 2 lượt.',
    damageMultiplier: 0.0,
    targetType: 'friendly_all',
    healMultiplier: 0.30,
    damageReductionMultiplier: 0.40,
    redirectRatio: 0.50,
    phase1Duration: 1600,
    phase2Duration: 2000,
    phase3Duration: 1200,
    effects: [
      {
        effectTypeCode: 'HEAL',
        effectTypeName: 'Hồi phục toàn đội',
        targetTypeCode: 'ALLY_ALL',
        scalings: [{ attributeTypeCode: 'HP', attributeTypeName: 'Máu tối đa', coefficient: 0.3, flatValue: 0 }]
      },
      {
        effectTypeCode: 'DAMAGE_REDUCTION',
        effectTypeName: 'Quà Bảo Kê (-50% Sát thương)',
        targetTypeCode: 'ALLY_RANDOM_2',
        baseValue: 50,
        durationTurns: 2
      },
      {
        effectTypeCode: 'DAMAGE_REDUCTION',
        effectTypeName: 'Da Thịt Vững Chãi (-40% Sát thương)',
        targetTypeCode: 'SELF',
        baseValue: 40,
        durationTurns: 2
      }
    ]
  },
  DEADLIFT_DIA_CHAN: {
    id: 'DEADLIFT_DIA_CHAN',
    name: 'Deadlift Địa Chấn',
    skillTypeCode: 'ENERGY',
    triggerCode: 'MANUAL_ENERGY_FULL',
    energyCost: 100,
    cost: 100,
    costType: 'MP',
    category: 'ultimate',
    color: '#fbbf24',
    type: 'physical',
    description: 'Hoàng Nguyên thực hiện động tác kéo tạ Deadlift cực đại và nện mạnh thanh đòn xuống đất, khiêu khích toàn bộ hàng trước đối thủ trong 2 lượt, giải phóng lực cơ bắp tạo lớp giáp chắn và phản lại 30% sát thương nhận vào.',
    damageMultiplier: 2.2,
    targetType: 'front_row',
    phase1Duration: 1800,
    phase2Duration: 1500,
    phase3Duration: 1200,
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương vật lý hàng trước',
        targetTypeCode: 'ENEMY_FRONT_ROW',
        damageSchoolCode: 'PHYSICAL',
        scalings: [{ attributeTypeCode: 'ATK', attributeTypeName: 'Công', coefficient: 2.2, flatValue: 0 }]
      },
      {
        effectTypeCode: 'TAUNT',
        effectTypeName: 'Khiêu Khích',
        targetTypeCode: 'ENEMY_FRONT_ROW',
        durationTurns: 2
      },
      {
        effectTypeCode: 'SHIELD',
        effectTypeName: 'Giáp Deadlift',
        targetTypeCode: 'SELF',
        durationTurns: 2,
        scalings: [{ attributeTypeCode: 'DEF', attributeTypeName: 'Phòng thủ', coefficient: 1.5, flatValue: 0 }]
      },
      {
        effectTypeCode: 'DAMAGE_REFLECTION',
        effectTypeName: 'Phản Sát Thương',
        targetTypeCode: 'SELF',
        baseValue: 30,
        durationTurns: 2
      }
    ]
  },
  HAI_BUG_SLASH: {
    id: 'HAI_BUG_SLASH',
    name: 'Dao Rạch Bug',
    skillTypeCode: 'NORMAL',
    triggerCode: 'ON_ATTACK',
    energyCost: 0,
    cost: 0,
    costType: 'NONE',
    category: 'basic',
    color: '#06b6d4',
    type: 'physical',
    description: 'Tấn công vật lý gây 100% công. Nếu gây sát thương, 30% cơ hội gắn hiệu ứng Chảy Máu trong 2 lượt.',
    damageMultiplier: 1.0,
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Sát thương vật lý',
        targetTypeCode: 'ENEMY_SINGLE',
        damageSchoolCode: 'PHYSICAL',
        scalings: [{ attributeTypeCode: 'ATK', attributeTypeName: 'Công', coefficient: 1.0, flatValue: 0 }]
      },
      {
        effectTypeCode: 'BLEED',
        effectTypeName: 'Chảy Máu',
        targetTypeCode: 'ENEMY_SINGLE',
        durationTurns: 2,
        chancePercent: 50,
        maxStacks: 2
      }
    ]
  },
  HAI_LAST_LAUGH: {
    id: 'HAI_LAST_LAUGH',
    name: 'Cười Đi, Sắp Hết Lượt Rồi',
    skillTypeCode: 'ENERGY',
    triggerCode: 'MANUAL_ENERGY_FULL',
    energyCost: 100,
    cost: 100,
    costType: 'MP',
    category: 'ultimate',
    color: '#ef4444',
    type: 'physical',
    description: 'Nhắm vào kẻ địch có % máu thấp nhất. Gắn Hoảng Loạn trong 1 lượt. Kích nổ toàn bộ Chảy Máu sẵn có gây 130% sát thương còn lại. Tấn công 3 nhát liên tiếp (80%, 90%, 130%), mỗi nhát có 30% gây Chảy Máu. Nếu hạ gục mục tiêu, hồi 25% thanh hành động và nhận 40% giảm sát thương.',
    damageMultiplier: 4.0,
    targetType: 'lowest_hp_percent',
    phase1Duration: 1400,
    phase2Duration: 1600,
    effects: [
      {
        effectTypeCode: 'PANIC',
        effectTypeName: 'Hoảng Loạn',
        targetTypeCode: 'LOWEST_HP_PERCENT',
        durationTurns: 1
      },
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Ám Sát 3 Nhát',
        targetTypeCode: 'LOWEST_HP_PERCENT',
        damageSchoolCode: 'PHYSICAL',
        scalings: [{ attributeTypeCode: 'ATK', attributeTypeName: 'Công', coefficient: 3.0, flatValue: 0 }]
      },
      {
        effectTypeCode: 'BLEED',
        effectTypeName: 'Chảy Máu',
        targetTypeCode: 'LOWEST_HP_PERCENT',
        durationTurns: 2,
        chancePercent: 50,
        maxStacks: 2
      }
    ]
  },
  PRIME_SHIELD_WARRANTY: {
    id: 'PRIME_SHIELD_WARRANTY',
    name: 'Khiên Này Có Bảo Hành',
    skillTypeCode: 'NORMAL',
    triggerCode: 'TURN_START',
    energyCost: 0,
    cost: 0,
    costType: 'NONE',
    category: 'basic',
    color: '#00e5ff',
    type: 'basic',
    description: 'Nghĩa Phục Prime dùng khiên đánh một kẻ địch gây 90% ATK sát thương vật lý. Tạo khiên cho đồng minh có % HP thấp nhất bằng 8% Max HP của Prime trong 2 lượt. Nhận 1 tầng Kiên Cố (+5% DEF, +5% Kháng Phép, tối đa 4 tầng). Đạt 4 tầng tạo khiên 12% Max HP và kích hoạt tiêu thụ.',
    damageMultiplier: 0.9,
    targetType: 'single',
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Đập Khiên',
        targetTypeCode: 'ENEMY_SINGLE',
        damageSchoolCode: 'PHYSICAL',
        scalings: [{ attributeTypeCode: 'ATK', attributeTypeName: 'Công', coefficient: 0.9, flatValue: 0 }]
      },
      {
        effectTypeCode: 'SHIELD',
        effectTypeName: 'Bảo Hành Khiên',
        targetTypeCode: 'ALLY_LOWEST_HP_PERCENT',
        durationTurns: 2
      },
      {
        effectTypeCode: 'PRIME_FORTITUDE',
        effectTypeName: 'Kiên Cố',
        targetTypeCode: 'SELF',
        durationTurns: 3,
        maxStacks: 4
      }
    ]
  },
  PRIME_FORTRESS_CHARGE: {
    id: 'PRIME_FORTRESS_CHARGE',
    name: 'Thành Trì Prime: Không Ai Được Phép Ngã',
    skillTypeCode: 'ENERGY',
    triggerCode: 'MANUAL_ENERGY_FULL',
    energyCost: 100,
    cost: 100,
    costType: 'MP',
    category: 'ultimate',
    color: '#00f0ff',
    type: 'ultimate',
    description: 'Dựng thành trì khổng lồ lao thẳng vào toàn bộ đội hình địch gây 60% ATK sát thương vật lý không crit. Kẻ địch trúng đòn nhận Lung Lay (-15 thanh hành động, -10% SPD trong 1 lượt). Chọn ngẫu nhiên tối đa 3 địch nhận Vỡ Trận (-15% sát thương gây ra trong 2 lượt). Thành trì quay về tạo khiên cho toàn đội (10% Max HP + 120% DEF của Prime, tối đa 25% Max HP mục tiêu) và nhận Hộ Vệ Prime (nhận thay 35% sát thương, tích Áp Lực đến 5 tầng rồi giải phóng hồi máu và phản đòn theo DEF).',
    damageMultiplier: 0.6,
    targetType: 'all_enemies',
    phase1Duration: 1450,
    phase2Duration: 1450,
    effects: [
      {
        effectTypeCode: 'DAMAGE',
        effectTypeName: 'Thành Trì Xung Phong',
        targetTypeCode: 'ENEMY_ALL',
        damageSchoolCode: 'PHYSICAL',
        scalings: [{ attributeTypeCode: 'ATK', attributeTypeName: 'Công', coefficient: 0.6, flatValue: 0 }]
      },
      {
        effectTypeCode: 'PRIME_STAGGER',
        effectTypeName: 'Lung Lay',
        targetTypeCode: 'ENEMY_ALL',
        durationTurns: 1
      },
      {
        effectTypeCode: 'PRIME_BROKEN_MORALE',
        effectTypeName: 'Vỡ Trận',
        targetTypeCode: 'ENEMY_RANDOM_3',
        durationTurns: 2
      },
      {
        effectTypeCode: 'SHIELD',
        effectTypeName: 'Thành Trì Che Chở',
        targetTypeCode: 'ALLY_ALL',
        durationTurns: 2
      },
      {
        effectTypeCode: 'PRIME_GUARDIAN',
        effectTypeName: 'Hộ Vệ Prime',
        targetTypeCode: 'SELF',
        durationTurns: 2
      }
    ]
  }
};
