import { LabRequest, LabSlot } from './battle-lab.model';
import { HeroStatsDto, PlayerHeroDto } from './player-hero.model';

export const LAB_CONFIG_MAX_BYTES = 64 * 1024;

function object(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error(path + ' phải là object.');
  return value as Record<string, unknown>;
}

function number(value: unknown, path: string, min: number, max: number, integer = true): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max ||
      (integer && !Number.isInteger(value)))
    throw new Error(path + ': cần số ' + (integer ? 'nguyên ' : '') + 'từ ' + min + ' đến ' + max + '.');
  return value;
}

function keys(value: Record<string, unknown>, allowed: string[], path: string): void {
  const unknown = Object.keys(value).find(k => !allowed.includes(k));
  if (unknown) throw new Error(path + '.' + unknown + ': thuộc tính không được hỗ trợ.');
}

// Returns a fresh, fully validated request. Never mutates the current form or catalog.
export function parseLabConfig(text: string, heroes: PlayerHeroDto[]): LabRequest {
  let parsed: unknown;
  try { parsed = JSON.parse(text.replace(/^\uFEFF/, '')); }
  catch { throw new Error('JSON không hợp lệ. Kiểm tra dấu phẩy, dấu ngoặc và dấu nháy kép.'); }
  let root = object(parsed, 'config');
  if ('schemaVersion' in root) {
    if (root['schemaVersion'] !== 1 && root['schemaVersion'] !== 2) throw new Error('Chỉ hỗ trợ schemaVersion = 1 hoặc 2.');
    keys(root, ['schemaVersion', 'settings'], 'config');
    root = object(root['settings'], 'settings');
  }
  keys(root, ['left', 'right', 'seed', 'count', 'maxRounds', 'defenseConstant'], 'settings');
  const count = number(root['count'], 'count', 1, 300);
  const fields: [keyof HeroStatsDto, number, number, boolean][] = [
    ['hp', 1, 1000000, true], ['atk', 0, 100000, true], ['def', 0, 100000, true],
    ['spd', 1, 10000, true], ['magicDamage', 0, 100000, true], ['magicResistance', 0, 100000, true],
    ['crit', 0, 1000, false], ['critDmg', 0, 1000, false],
    ['accuracy', 0, 1000, false], ['resistance', 0, 1000, false], ['lifesteal', 0, 1000, false]
  ];
  const team = (side: string): LabSlot[] => {
    const slots = root[side];
    if (!Array.isArray(slots) || slots.length < 1 || slots.length > 5)
      throw new Error(side + ': cần 1–5 tướng.');
    const positions = new Set<number>();
    return slots.map((value, i) => {
      const path = side + '[' + i + ']';
      const slot = object(value, path);
      keys(slot, ['heroTemplateId', 'position', 'mode', 'stats', 'build'], path);
      const id = number(slot['heroTemplateId'], path + '.heroTemplateId', 1, 2147483647);
      const hero = heroes.find(h => (h.heroTemplateId ?? h.id) === id);
      if (!hero) throw new Error(path + ': không tìm thấy tướng có heroTemplateId = ' + id + '.');
      const position = number(slot['position'], path + '.position', 1, 5);
      if (positions.has(position)) throw new Error(path + ': vị trí ' + position + ' bị trùng trong đội.');
      positions.add(position);
      const mode = slot['mode'] ?? 'CUSTOM';
      if (mode === 'BUILD') {
        if ('stats' in slot) throw new Error(path + ': BUILD không nhận stats để tránh cộng hai lần.');
        const b = object(slot['build'], path + '.build');
        keys(b, ['level', 'stars', 'auraTier', 'rollSeed', 'equipment'], path + '.build');
        if (!Array.isArray(b['equipment']) || b['equipment'].length > 6) throw new Error(path + ': tối đa 6 trang bị.');
        const equipment = b['equipment'].map((raw, index) => {
          const e = object(raw, path + '.equipment[' + index + ']');
          keys(e, ['itemTemplateId', 'enhancement', 'stars'], path + '.equipment');
          return { itemTemplateId: number(e['itemTemplateId'], path + '.itemTemplateId', 1, 2147483647),
            enhancement: number(e['enhancement'], path + '.enhancement', 0, 15),
            stars: number(e['stars'], path + '.equipment.stars', 0, 5) };
        });
        return { heroTemplateId: id, position, mode: 'BUILD', build: {
          level: number(b['level'], path + '.level', 1, 1000), stars: number(b['stars'], path + '.stars', 1, 5),
          auraTier: number(b['auraTier'], path + '.auraTier', 1, 4),
          rollSeed: number(b['rollSeed'], path + '.rollSeed', 0, 2147483647), equipment
        } };
      }
      if (mode !== 'CUSTOM' || 'build' in slot) throw new Error(path + ': CUSTOM chỉ nhận stats, không nhận build.');
      const overrides = object(slot['stats'] ?? {}, path + '.stats');
      keys(overrides, fields.map(f => f[0]), path + '.stats');
      const stats = {} as HeroStatsDto;
      for (const [key, min, max, integer] of fields) {
        const value = key in overrides ? overrides[key] : (hero.stats[key] ?? 0);
        stats[key] = number(value, path + '.stats.' + key, min, max, integer);
      }
      return { heroTemplateId: id, position, mode: 'CUSTOM', stats };
    });
  };
  return {
    seed: number(root['seed'], 'seed', 0, 2147483647 - count), count,
    maxRounds: number(root['maxRounds'], 'maxRounds', 1, 100),
    defenseConstant: number(root['defenseConstant'], 'defenseConstant', Number.MIN_VALUE, 1000000, false),
    left: team('left'), right: team('right')
  };
}

export function serializeLabConfig(settings: LabRequest): string {
  return JSON.stringify({ schemaVersion: 2, settings }, null, 2);
}
