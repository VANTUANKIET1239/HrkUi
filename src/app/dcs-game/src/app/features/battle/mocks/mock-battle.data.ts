import { Hero } from '../../../core/models/hero.model';
import { BattleLog } from '../../../core/models/battle-log.model';
import { Skill } from '../../../core/models/skill.model';

export const INITIAL_HEROES: Hero[] = [
  // Left Team (Heroes)
  {
    id: 1,
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
    skills: ['HEAVENLY_JUDGMENT'],
    level: 4
  },
  {
    id: 2,
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
    level: 3
  },
  {
    id: 3,
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
    statusEffects: ['Shield', 'Red Lightning'],
    skills: ['NORMAL_ATTACK', 'SLASH', 'SWORD_DANCE', 'RICARDO_MILOS'],
    level: 2
  },
  {
    id: 4,
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
    level: 2
  },
  {
    id: 5,
    name: 'Tester Đẹp',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=tester-dep',
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
    skills: ['NORMAL_ATTACK', 'AUTOMATION_TEST'],
    level: 1
  },

  // Right Team (Enemies)
  {
    id: 6,
    name: 'Sếp Căng Thẳng',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=sep-cang-thang',
    hp: 700,
    maxHp: 700,
    mana: 10,
    maxMana: 100,
    attack: 180,
    defense: 90,
    speed: 125,
    position: 1,
    team: 'right',
    statusEffects: ['Angry Aura'],
    skills: ['NORMAL_ATTACK', 'FIREBALL'],
    level: 4
  },
  {
    id: 7,
    name: 'PM Hối Hả',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=pm-hoi-ha',
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
    skills: ['NORMAL_ATTACK', 'LIGHTNING_STRIKE'],
    level: 3
  },
  {
    id: 8,
    name: 'QA Kỹ Tính',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=qa-ky-tinh',
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
    skills: ['NORMAL_ATTACK', 'CRITICAL_BUG'],
    level: 2
  },
  {
    id: 9,
    name: 'Client Khó Tính',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=client-kho-tinh',
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
    skills: ['NORMAL_ATTACK', 'CHANGE_REQUIREMENT', 'COMPLAIN'],
    level: 2
  },
  {
    id: 10,
    name: 'Bug Vô Tận',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=bug-vo-tan',
    hp: 1000,
    maxHp: 1000,
    mana: 100,
    maxMana: 100,
    attack: 170,
    defense: 85,
    speed: 90,
    position: 5,
    team: 'right',
    statusEffects: ['Immortal Bug'],
    skills: ['NORMAL_ATTACK', 'NULL_POINTER', 'STACK_OVERFLOW'],
    level: 1
  }
];

export const MOCK_BATTLE_LOGS: BattleLog[] = [
  {
    turn: 1,


    actorId: 3,
    targetId: 7,
    skillId: 'RICARDO_MILOS',
    damage: 500,
    isCrit: true

  },
  {
    turn: 2,
    actorId: 4,
    targetId: 8,
    skillId: 'RANDOM_KNOWLEDGE_DROP',
    damage: 450,
    isCrit: false
  },
  {
    turn: 3,
    actorId: 1,
    targetId: 6,
    skillId: 'HEAVENLY_JUDGMENT',
    damage: 300,
    isCrit: false
  },
  {
    turn: 4,
    actorId: 7,
    targetId: 2,
    skillId: 'LIGHTNING_STRIKE',
    damage: 220,
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
    actorId: 8,
    targetId: 3,
    skillId: 'CRITICAL_BUG',
    damage: 250,
    isCrit: false
  },
  {
    turn: 7,
    actorId: 2,
    targetId: 7,
    skillId: 'VAX_A_MILLION_SANITZATION',
    damage: 300,
    isCrit: false
  },
  {
    turn: 8,
    actorId: 9,
    targetId: 4,
    skillId: 'CHANGE_REQUIREMENT',
    damage: 350,
    isCrit: false
  },
  {
    turn: 9,
    actorId: 6,
    targetId: 1,
    skillId: 'FIREBALL',
    damage: 260,
    isCrit: true
  },
  {
    turn: 10,
    actorId: 10,
    targetId: 5,
    skillId: 'NULL_POINTER',
    damage: 200,
    isCrit: false
  },
  {
    turn: 11,
    actorId: 5,
    targetId: 8,
    skillId: 'AUTOMATION_TEST',
    damage: 400,
    isCrit: false
  },
  {
    turn: 12,
    actorId: 3,
    targetId: 9,
    skillId: 'SLASH',
    damage: 300,
    isCrit: false
  },
  {
    turn: 13,
    actorId: 9,
    targetId: 1,
    skillId: 'COMPLAIN',
    damage: 150,
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
    actorId: 10,
    targetId: 1,
    skillId: 'STACK_OVERFLOW',
    damage: 150,
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
  NORMAL_ATTACK: {
    id: 'NORMAL_ATTACK',
    name: 'Đánh Thường',
    cost: 0,
    costType: 'MP',
    category: 'basic',
    color: '#aaaaaa',
    type: 'physical',
    description: 'Tấn công vật lý cơ bản gây sát thương chuẩn.',
    damageMultiplier: 1.0
  },
  FIREBALL: {
    id: 'FIREBALL',
    name: 'Hỏa Cầu Sếp Phạt',
    cost: 30,
    costType: 'MP',
    category: 'rage',
    color: '#ff3333',
    type: 'magical',
    description: 'Sếp ném hỏa cầu thiêu rụi tinh thần coder.',
    damageMultiplier: 1.5
  },
  HEAVY_SLASH: {
    id: 'HEAVY_SLASH',
    name: 'Chém Deadline',
    cost: 25,
    costType: 'MP',
    category: 'rage',
    color: '#ffaa00',
    type: 'physical',
    description: 'Vung kiếm chém mạnh làm giảm thời gian deadline.',
    damageMultiplier: 1.4
  },
  LIGHTNING_STRIKE: {
    id: 'LIGHTNING_STRIKE',
    name: 'Sét Đánh Khẩn Cấp',
    cost: 30,
    costType: 'MP',
    category: 'thunder',
    color: '#33ccff',
    type: 'magical',
    description: 'PM triệu hồi sét đánh thẳng vào máy chủ.',
    damageMultiplier: 1.4
  },
  ULTIMATE_SIXPACK: {
    id: 'ULTIMATE_SIXPACK',
    name: 'Nộ Long Sáu Múi',
    cost: 75,
    costType: 'MP',
    category: 'ultimate',
    color: '#ff00aa',
    type: 'ultimate',
    description: 'K cởi trần gồng mình hóa thần công phá địch.',
    damageMultiplier: 2.5
  },
  CRITICAL_BUG: {
    id: 'CRITICAL_BUG',
    name: 'Bug Nghiêm Trọng',
    cost: 30,
    costType: 'MP',
    category: 'rage',
    color: '#cc33ff',
    type: 'magical',
    description: 'QA phát hiện bug critical chặn đứng tiến trình.',
    damageMultiplier: 1.3
  },
  SWORD_DANCE: {
    id: 'SWORD_DANCE',
    name: 'Vũ Điệu Chuẩn Men',
    cost: 70,
    costType: 'MP',
    category: 'ultimate',
    color: '#33ffaa',
    type: 'ultimate',
    description: 'Tuyệt chiêu kiếm vũ chuẩn men chém nát deadline.',
    damageMultiplier: 2.2
  },
  CHANGE_REQUIREMENT: {
    id: 'CHANGE_REQUIREMENT',
    name: 'Đổi Yêu Cầu Gấp',
    cost: 35,
    costType: 'MP',
    category: 'rage',
    color: '#ff33cc',
    type: 'magical',
    description: 'Client đổi yêu cầu phút chót gây sát thương tinh thần cực lớn.',
    damageMultiplier: 1.5
  },
  REFACTOR_CODE: {
    id: 'REFACTOR_CODE',
    name: 'Tái Cấu Trúc Đẹp',
    cost: 25,
    costType: 'MP',
    category: 'thunder',
    color: '#00aaff',
    type: 'magical',
    description: 'Tái cấu trúc code mượt mà tối ưu hóa hệ thống.',
    damageMultiplier: 1.5
  },
  NULL_POINTER: {
    id: 'NULL_POINTER',
    name: 'Lỗi Con Trỏ Null',
    cost: 30,
    costType: 'MP',
    category: 'thunder',
    color: '#ff3300',
    type: 'magical',
    description: 'Gây lỗi Null Pointer làm crash ứng dụng.',
    damageMultiplier: 1.3
  },
  AUTOMATION_TEST: {
    id: 'AUTOMATION_TEST',
    name: 'Test Tự Động',
    cost: 0,
    costType: 'MP',
    category: 'basic',
    color: '#33ff33',
    type: 'physical',
    description: 'Tester tự động hóa kiểm thử liên tục.',
    damageMultiplier: 1.2
  },
  SLASH: {
    id: 'SLASH',
    name: 'Chém Thường',
    cost: 0,
    costType: 'MP',
    category: 'basic',
    color: '#dddddd',
    type: 'physical',
    description: 'Tấn công chém thường cơ bản.',
    damageMultiplier: 1.0
  },
  COMPLAIN: {
    id: 'COMPLAIN',
    name: 'Phàn Nàn Giờ Chót',
    cost: 25,
    costType: 'MP',
    category: 'rage',
    color: '#ff6600',
    type: 'magical',
    description: 'Client phàn nàn về thiết kế làm rối loạn đội hình.',
    damageMultiplier: 1.1
  },
  DEPLOY_PROD: {
    id: 'DEPLOY_PROD',
    name: 'Lên Prod Bảnh Tỏn',
    cost: 75,
    costType: 'MP',
    category: 'ultimate',
    color: '#ccff33',
    type: 'ultimate',
    description: 'Coder Bảnh đẩy code thẳng lên Production không cần test.',
    damageMultiplier: 2.5
  },
  STACK_OVERFLOW: {
    id: 'STACK_OVERFLOW',
    name: 'Tràn Bộ Đệm',
    cost: 30,
    costType: 'MP',
    category: 'thunder',
    color: '#ff0000',
    type: 'magical',
    description: 'Tràn bộ đệm làm sập hệ thống phòng ngự.',
    damageMultiplier: 1.2
  },
  CLOSE_JIRA: {
    id: 'CLOSE_JIRA',
    name: 'Đóng Task Jira!',
    cost: 80,
    costType: 'MP',
    category: 'ultimate',
    color: '#00ffaa',
    type: 'ultimate',
    description: 'K cởi trần đóng task Jira kết thúc dự án thành công.',
    damageMultiplier: 3.0
  },
  HEAVENLY_JUDGMENT: {
    id: 'HEAVENLY_JUDGMENT',
    name: 'Phán Quyết Sấm Sét Cởi Trần',
    cost: 90,
    costType: 'MP',
    category: 'heavenly',
    color: '#ff0055',
    type: 'ultimate',
    description: 'Tuyệt kỹ sấm sét hủy diệt toàn bộ kẻ địch trên chiến trường.',
    damageMultiplier: 3.5,
    isAoE: true
  },
  VAX_A_MILLION_SANITZATION: {
    id: 'VAX_A_MILLION_SANITZATION',
    name: 'Pháo Quang Phổ Tiệt Trùng',
    cost: 60,
    costType: 'MP',
    category: 'ultimate',
    color: '#00ffcc',
    type: 'ultimate',
    description: 'Nam Deadline rút ống tiêm Vax-A-Million bắn luồng laser khử khuẩn cực mạnh quét sạch toàn bộ kẻ địch trên đường thẳng đối diện.',
    damageMultiplier: 2.8,
    targetType: 'linear'
  },
  RICARDO_MILOS: {
    id: 'RICARDO_MILOS',
    name: 'Ricardo Milos!',
    cost: 50,
    costType: 'MP',
    category: 'ultimate',
    color: '#ff0033',
    type: 'ultimate',
    description: 'Chuẩn Men hóa thân thành Ricardo Milos thực hiện điệu nhảy Crimson quyến rũ gây chấn động mạnh lên mục tiêu hàng sau cùng làn.',
    damageMultiplier: 2.5,
    targetType: 'same_lane_back_row'
  },
  RANDOM_KNOWLEDGE_DROP: {
    id: 'RANDOM_KNOWLEDGE_DROP',
    name: 'Kiến Thức Sang Chấn',
    cost: 50,
    costType: 'MP',
    category: 'ultimate',
    color: '#00d9ff',
    type: 'ultimate',
    description: 'Coder Bảnh triệu hồi cuốn sách giáo khoa khổng lồ từ trên trời giáng xuống đầu một kẻ địch ngẫu nhiên.',
    damageMultiplier: 2.6,
    targetType: 'random'
  }
};
