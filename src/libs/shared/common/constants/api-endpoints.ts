export const ApiEndpoints = {
  // Authentication Service
  Auth: {
    Login: 'auth/login',
    Register: 'auth/register',
    Logout: 'auth/logout',
    Refresh: 'auth/refresh-token',
    Applications: 'auth/applications'
  },

  // Game Service - Player Profile & Wallet
  Player: {
    Me: 'dcs-game/player/me',
    Profile: 'dcs-game/player/profile',
    Wallet: 'dcs-game/player/wallet',
    Avatars: 'dcs-game/player/avatars',
    SelectAvatar: 'dcs-game/player/avatar/template',
    CustomAvatar: 'dcs-game/player/avatar/custom',
    CustomAvatarImage: (playerId: number) => `dcs-game/player/avatar/custom/${playerId}`
  },

  // Game Service - Player Heroes
  PlayerHeroes: {
    List: 'dcs-game/player/heroes/list',
    Detail: 'dcs-game/player/heroes/detail',
    Flags: (id: number) => `dcs-game/player/heroes/${id}/flags`,
    Equip: (id: number) => `dcs-game/player/heroes/${id}/equipment`,
    Unequip: (id: number, slotCode: string) => `dcs-game/player/heroes/${id}/equipment/${slotCode}`,
    UnequipAll: (id: number) => `dcs-game/player/heroes/${id}/equipment`,
    SwapEquipment: (id: number) => `dcs-game/player/heroes/${id}/equipment/swap`,
    UpgradePreview: (id: number) => `dcs-game/player/heroes/${id}/upgrade-preview`,
    Upgrade: (id: number) => `dcs-game/player/heroes/${id}/upgrade`,
    StarUpgradePreview: (id: number) => `dcs-game/player/heroes/${id}/star-upgrade-preview`,
    StarUpgrade: (id: number) => `dcs-game/player/heroes/${id}/star-upgrade`
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
    EnhancementPreview: (id: number) => `dcs-game/inventory/enhancement/preview/${id}`,
    DowngradePreview: (id: number, level: number) => `dcs-game/inventory/enhancement/downgrade-preview/${id}?targetLevel=${level}`,
    Downgrade: 'dcs-game/inventory/enhancement/downgrade'
  },

  // Game Service - Formation
  Formation: {
    List: 'dcs-game/formations',
    Detail: (code: string) => `dcs-game/formations/${code}`,
    UpdatePositions: (code: string) => `dcs-game/formations/${code}/positions`,
    Select: (code: string) => `dcs-game/formations/${code}/select`,
    Upgrade: (code: string) => `dcs-game/formations/${code}/upgrade`,
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
    LabCatalog: 'dcs-game/battle/lab/catalog',
    LabRun: 'dcs-game/battle/lab/run',
    Start: 'dcs-game/battle/start',
    InitialState: 'dcs-game/battle/initial-state',
    Logs: 'dcs-game/battle/logs'
  },
  Dungeon: {
    Maps: 'dcs-game/dungeons/maps',
    Map: (id: number) => `dcs-game/dungeons/maps/${id}`,
    Start: (stageId: number) => `dcs-game/dungeons/stages/${stageId}/start`,
    FormationPreview: (stageId: number) => `dcs-game/dungeons/stages/${stageId}/formation-preview`,
    Stamina: 'dcs-game/dungeons/stamina',
    PurchaseStamina: 'dcs-game/dungeons/stamina/purchase',
    ClaimChest: (chestId: number) => `dcs-game/dungeons/chests/${chestId}/claim`
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
  },
  Events: {
    List: 'dcs-game/events',
    TowerProgress: 'dcs-game/events/tower/progress',
    TowerFloors: 'dcs-game/events/tower/floors',
    TowerFloorDetail: (floorNumber: number) => `dcs-game/events/tower/floors/${floorNumber}`,
    TowerStartBattle: (floorNumber: number) => `dcs-game/events/tower/floors/${floorNumber}/start`,
    TowerStartNewRun: 'dcs-game/events/tower/new-run',
    TowerClaimChest: (chestId: number) => `dcs-game/events/tower/chests/${chestId}/claim`,
    TowerStartQuickClimb: 'dcs-game/events/tower/quick-climb/start',
    TowerCurrentQuickClimb: 'dcs-game/events/tower/quick-climb/active',
    TowerQuickClimbJob: (jobId: string) => `dcs-game/events/tower/quick-climb/${jobId}`,
    TowerStopQuickClimb: (jobId: string) => `dcs-game/events/tower/quick-climb/${jobId}/stop`,
    TowerPendingRewards: 'dcs-game/events/tower/pending-rewards',
    TowerClaimPendingReward: (pendingId: number) => `dcs-game/events/tower/pending-rewards/${pendingId}/claim`,
    TowerBattleHistory: (battleId: string) => `dcs-game/events/tower/battles/${battleId}`
  }
};
