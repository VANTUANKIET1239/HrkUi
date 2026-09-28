export interface LightningPoint {
  x: number;
  y: number;
}

export interface LightningChainPoint {
  combatantId: number;
  x: number;
  y: number;
  order: number;
}

export interface ThanhThaiLightningVfxState {
  source: LightningChainPoint;
  targets: LightningChainPoint[];
  empowered: boolean;
  castSequence: number;
  visualSpeed: number;
}

export interface LightningBranchData {
  mainD: string;
  jitterD: string;
  forks: string[];
  startPoint: LightningPoint;
  endPoint: LightningPoint;
  length: number;
  hitIndex: number;
}

/**
 * Fast deterministic PRNG (mulberry32) ensuring identical replay visually for same seed
 */
export function createSeededRandom(seed: number): () => number {
  let s = Math.abs(seed | 0) || 1337;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Builds an SVG path string from an array of 2D points.
 */
export function pointsToSvgPath(points: LightningPoint[]): string {
  if (points.length === 0) return '';
  let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x.toFixed(1)},${points[i].y.toFixed(1)}`;
  }
  return d;
}

/**
 * Generates natural zigzag points between two points with controlled perpendicular displacement.
 */
export function generateZigzagPoints(
  start: LightningPoint,
  end: LightningPoint,
  rand: () => number,
  options?: {
    maxDisplacement?: number;
    segmentCount?: number;
    jitterFactor?: number;
  }
): LightningPoint[] {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) return [start, end];

  const nx = -dy / dist;
  const ny = dx / dist;

  const defaultSegments = Math.max(8, Math.min(14, Math.round(dist / 40)));
  const segments = options?.segmentCount ?? defaultSegments;
  const maxDisp = options?.maxDisplacement ?? Math.min(65, Math.max(22, dist * 0.16));
  const jitter = options?.jitterFactor ?? 1;

  const points: LightningPoint[] = [{ x: start.x, y: start.y }];

  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    // Bell curve factor: highest deviation in the middle, anchored at ends
    const envelope = Math.sin(t * Math.PI);
    const displacement = (rand() - 0.5) * 2 * maxDisp * envelope * jitter;

    // Add slight longitudinal variation for more organic fracture look
    const alongVariation = (rand() - 0.5) * (dist / segments) * 0.35;
    const baseProgress = t + alongVariation / dist;
    const clampedProgress = Math.max(0.05, Math.min(0.95, baseProgress));

    const px = start.x + dx * clampedProgress + nx * displacement;
    const py = start.y + dy * clampedProgress + ny * displacement;

    points.push({ x: px, y: py });
  }

  points.push({ x: end.x, y: end.y });
  return points;
}

/**
 * Generates forked secondary branches shooting off from the main lightning trunk.
 */
export function generateForkBranches(
  mainPoints: LightningPoint[],
  rand: () => number,
  empowered: boolean
): string[] {
  const forks: string[] = [];
  if (mainPoints.length < 5) return forks;

  const forkCount = empowered ? 4 : 2;
  const step = Math.floor(mainPoints.length / (forkCount + 1));

  for (let f = 1; f <= forkCount; f++) {
    const index = Math.min(mainPoints.length - 2, f * step + Math.floor((rand() - 0.5) * 2));
    const origin = mainPoints[index];
    const next = mainPoints[index + 1] ?? mainPoints[index];

    const dx = next.x - origin.x;
    const dy = next.y - origin.y;

    // Branch angle ~30-50 degrees relative to main flow
    const sign = rand() > 0.5 ? 1 : -1;
    const angle = Math.atan2(dy, dx) + sign * (0.55 + rand() * 0.45);
    const branchLength = (40 + rand() * 55) * (empowered ? 1.3 : 1);

    const forkTarget: LightningPoint = {
      x: origin.x + Math.cos(angle) * branchLength,
      y: origin.y + Math.sin(angle) * branchLength
    };

    const forkPts = generateZigzagPoints(origin, forkTarget, rand, {
      segmentCount: 4 + Math.floor(rand() * 3),
      maxDisplacement: 14 + rand() * 12
    });

    forks.push(pointsToSvgPath(forkPts));
  }

  return forks;
}

/**
 * Creates full lightning branch data with deterministic seeded RNG, jitter variant, and forks.
 */
export function generateLightningBranch(
  start: LightningPoint,
  end: LightningPoint,
  seed: number,
  empowered: boolean,
  hitIndex: number
): LightningBranchData {
  const combinedSeed = Math.abs(seed * 31 + hitIndex * 1013 + 77);
  const randMain = createSeededRandom(combinedSeed);
  const randJitter = createSeededRandom(combinedSeed + 509);
  const randFork = createSeededRandom(combinedSeed + 997);

  const mainPoints = generateZigzagPoints(start, end, randMain, {
    maxDisplacement: empowered ? 42 : 30
  });

  const jitterPoints = generateZigzagPoints(start, end, randJitter, {
    maxDisplacement: empowered ? 38 : 28,
    jitterFactor: 0.95
  });

  const forks = generateForkBranches(mainPoints, randFork, empowered);
  const dist = Math.hypot(end.x - start.x, end.y - start.y);

  return {
    mainD: pointsToSvgPath(mainPoints),
    jitterD: pointsToSvgPath(jitterPoints),
    forks,
    startPoint: start,
    endPoint: end,
    length: dist,
    hitIndex
  };
}

/**
 * Generates vertical lightning strike points from above for single-target rebound strikes.
 */
export function generateVerticalStrike(
  target: LightningPoint,
  seed: number,
  empowered: boolean,
  strikeIndex: number
): LightningBranchData {
  const rand = createSeededRandom(seed * 17 + strikeIndex * 337 + 11);
  const skyHeight = 260 + rand() * 120;
  const start: LightningPoint = {
    x: target.x + (rand() - 0.5) * 70,
    y: Math.max(0, target.y - skyHeight)
  };

  return generateLightningBranch(start, target, seed, empowered, strikeIndex);
}
