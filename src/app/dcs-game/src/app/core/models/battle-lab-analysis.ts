import { LabReport } from './battle-lab.model';

function distribution(values: number[]) {
  if (!values.length) return { mean: 0, min: 0, max: 0, standardDeviation: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return { mean, min: Math.min(...values), max: Math.max(...values),
    standardDeviation: Math.sqrt(values.reduce((s, x) => s + (x - mean) ** 2, 0) / values.length) };
}

export function createBalanceAnalysis(report: LabReport) {
  const n = report.runs.length;
  const wins = report.runs.filter(r => r.winner === 'LEFT').length;
  const rightWins = report.runs.filter(r => r.winner === 'RIGHT').length;
  const p = n ? wins / n : 0;
  const z2 = 1.96 ** 2;
  const center = n ? (p + z2 / (2 * n)) / (1 + z2 / n) : 0;
  const margin = n ? 1.96 * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n)) / (1 + z2 / n) : 0;
  return {
    format: 'HRK_BALANCE_ANALYSIS', version: 2,
    createdAtUtc: report.createdAtUtc, engineVersion: report.engineVersion, snapshotHash: report.snapshotHash,
    settings: report.settings, battleConfigs: report.battleConfigs,
    resolvedSnapshot: report.resolvedSnapshot, resolvedBuilds: report.resolvedBuilds,
    summary: { count: n, leftWins: wins, rightWins, draws: n - wins - rightWins,
      leftWinRate: p, leftWinRateWilson95: [Math.max(0, center - margin), Math.min(1, center + margin)],
      rounds: distribution(report.runs.map(r => r.rounds)) },
    heroes: report.totals.map(total => {
      const runs = report.runs.flatMap(r => r.heroes.filter(h => h.statistics.combatantId === total.combatantId));
      return {
        combatantId: total.combatantId, team: total.team, name: total.heroName,
        physicalDamage: distribution(runs.map(h => h.statistics.physicalDamageDealt)),
        magicDamage: distribution(runs.map(h => h.statistics.magicDamageDealt)),
        healing: distribution(runs.map(h => h.statistics.healingDone)),
        damageTaken: distribution(runs.map(h => h.statistics.physicalDamageTaken + h.statistics.magicDamageTaken)),
        remainingHp: distribution(runs.map(h => h.remainingHp)),
        survivalRate: runs.length ? runs.filter(h => h.remainingHp > 0).length / runs.length : 0,
        casts: distribution(runs.map(h => h.skillCasts)), energyCasts: distribution(runs.map(h => h.energyCasts))
      };
    }),
    skills: report.skills,
    outcomes: report.runs.map(r => ({ seed: r.seed, winner: r.winner, rounds: r.rounds })),
    warnings: [...report.warnings,
      ...(n < 100 ? ['Small sample: run at least 100 seeds before interpreting win rates.'] : []),
      ...(n && (p > .9 || p < .1) ? ['One-sided matchup observed. Check build investment, counters and side advantage before nerfing a hero.'] : []),
      'Wilson interval describes seed variation for this fixed matchup, not all opponents or all equipment rolls.',
      'Skill HP damage excludes shield absorption, bleed-specific events and overkill; do not treat it as raw skill scaling.'],
    analysisChecklist: ['Compare equal-investment builds and the same seed range.', 'Repeat with left/right swapped.',
      'Test tank, sustain, burst and control opponents before generalizing.',
      'Separate engine defects or unsupported stats from balance problems.', 'Propose one isolated parameter change, then rerun the baseline.']
  };
}
