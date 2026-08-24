export const ApiEndpoints = {
  // Authentication Service
  Auth: {
    Login: 'auth/login',
    Register: 'auth/register',
    Logout: 'auth/logout',
    Refresh: 'auth/refresh-token'
  },

  // Game Service - Player Profile & Wallet
  Player: {
    Profile: 'dcs-game/player/profile',
    Wallet: 'dcs-game/player/wallet'
  },

  // Game Service - Player Heroes
  PlayerHeroes: {
    List: 'dcs-game/player/heroes/list',
    Detail: 'dcs-game/player/heroes/detail'
  },

  // Game Service - Inventory
  Inventory: {
    List: 'dcs-game/inventory/items',
    HeroEquipment: 'dcs-game/inventory/hero-equipment'
  },

  // Game Service - Formation
  Formation: {
    Get: 'dcs-game/formation/main'
  },

  // Game Service - Catalog Templates
  Catalog: {
    Heroes: 'dcs-game/catalog/heroes',
    HeroDetail: 'dcs-game/catalog/hero-detail',
    Skills: 'dcs-game/catalog/skills',
    Items: 'dcs-game/catalog/items'
  },

  // Game Service - Battle Engine
  Battle: {
    InitialState: 'dcs-game/battle/initial-state',
    Logs: 'dcs-game/battle/logs'
  },

  // Game Service - Metadata & Enums
  Metadata: {
    Rarities: 'dcs-game/metadata/rarities',
    Factions: 'dcs-game/metadata/factions',
    Classes: 'dcs-game/metadata/classes',
    ItemCategories: 'dcs-game/metadata/item-categories',
    SkillEnums: 'dcs-game/metadata/skill-enums'
  }
};
