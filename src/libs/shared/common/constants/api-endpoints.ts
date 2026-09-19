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
    Me: 'dcs-game/player/me',
    Profile: 'dcs-game/player/profile',
    Wallet: 'dcs-game/player/wallet'
  },

  // Game Service - Player Heroes
  PlayerHeroes: {
    List: 'dcs-game/player/heroes/list',
    Detail: 'dcs-game/player/heroes/detail',
    Flags: (id: number) => `dcs-game/player/heroes/${id}/flags`,
    Equip: (id: number) => `dcs-game/player/heroes/${id}/equipment`,
    Unequip: (id: number, slotCode: string) => `dcs-game/player/heroes/${id}/equipment/${slotCode}`
    ,UpgradePreview: (id: number) => `dcs-game/player/heroes/${id}/upgrade-preview`
    ,Upgrade: (id: number) => `dcs-game/player/heroes/${id}/upgrade`
  },

  // Game Service - Inventory
  Inventory: {
    List: 'dcs-game/inventory/items',
    Equipment: 'dcs-game/inventory/equipment',
    HeroEquipment: 'dcs-game/inventory/hero-equipment',
    Sell: 'dcs-game/inventory/sell',
    Lock: (id: number) => `dcs-game/inventory/items/${id}/lock`,
    ExpandCapacity: 'dcs-game/inventory/expand-capacity',
    Enhance: 'dcs-game/inventory/enhance',
    EnhancementConfigs: 'dcs-game/inventory/enhancement/configs',
    ForgeEquipment: 'dcs-game/inventory/forge-equipment',
    EnhancementPreview: (id: number) => `dcs-game/inventory/enhancement/preview/${id}`
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
  },

  GameConfig: {
    Features: 'dcs-game/game-config/features',
    CombatPower: 'dcs-game/game-config/combat-power'
  }
};
