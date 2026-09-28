import {
  createSeededRandom,
  generateLightningBranch,
  generateVerticalStrike,
  generateZigzagPoints,
  pointsToSvgPath
} from './thanh-thai-lightning.util';

describe('ThanhThaiLightningUtil Specs', () => {
  describe('createSeededRandom', () => {
    it('should be deterministic for the same seed', () => {
      const rand1 = createSeededRandom(12345);
      const rand2 = createSeededRandom(12345);

      const seq1 = [rand1(), rand1(), rand1(), rand1()];
      const seq2 = [rand2(), rand2(), rand2(), rand2()];

      expect(seq1).toEqual(seq2);
    });

    it('should produce different sequences for different seeds', () => {
      const rand1 = createSeededRandom(12345);
      const rand2 = createSeededRandom(99999);

      expect(rand1()).not.toEqual(rand2());
    });

    it('should produce values strictly in [0, 1)', () => {
      const rand = createSeededRandom(777);
      for (let i = 0; i < 50; i++) {
        const val = rand();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });
  });

  describe('pointsToSvgPath', () => {
    it('should return empty string for empty array', () => {
      expect(pointsToSvgPath([])).toBe('');
    });

    it('should format standard SVG path commands', () => {
      const pts = [{ x: 10, y: 20 }, { x: 30, y: 40 }, { x: 50, y: 60 }];
      const path = pointsToSvgPath(pts);
      expect(path).toBe('M 10.0,20.0 L 30.0,40.0 L 50.0,60.0');
    });
  });

  describe('generateZigzagPoints', () => {
    it('should maintain exact start and end points', () => {
      const start = { x: 100, y: 200 };
      const end = { x: 500, y: 350 };
      const rand = createSeededRandom(42);

      const points = generateZigzagPoints(start, end, rand);

      expect(points.length).toBeGreaterThanOrEqual(8);
      expect(points[0]).toEqual(start);
      expect(points[points.length - 1]).toEqual(end);
    });

    it('should apply lateral displacements between endpoints', () => {
      const start = { x: 100, y: 100 };
      const end = { x: 500, y: 100 };
      const rand = createSeededRandom(42);

      const points = generateZigzagPoints(start, end, rand, { maxDisplacement: 30 });
      // Inner points should deviate from y = 100
      const innerY = points.slice(1, -1).map(p => p.y);
      const hasDeviation = innerY.some(y => Math.abs(y - 100) > 1);
      expect(hasDeviation).toBeTrue();
    });

    it('should work correctly right-to-left as well as left-to-right', () => {
      const start = { x: 800, y: 200 };
      const end = { x: 200, y: 400 };
      const rand = createSeededRandom(99);

      const points = generateZigzagPoints(start, end, rand);
      expect(points[0]).toEqual(start);
      expect(points[points.length - 1]).toEqual(end);
    });
  });

  describe('generateLightningBranch', () => {
    it('should generate identical main and jitter paths for identical seed and hitIndex (Replay safety)', () => {
      const start = { x: 150, y: 300 };
      const end = { x: 600, y: 300 };

      const branchA = generateLightningBranch(start, end, 888, false, 1);
      const branchB = generateLightningBranch(start, end, 888, false, 1);

      expect(branchA.mainD).toBe(branchB.mainD);
      expect(branchA.jitterD).toBe(branchB.jitterD);
      expect(branchA.forks).toEqual(branchB.forks);
    });

    it('should generate more fork branches when empowered (Full Aura)', () => {
      const start = { x: 150, y: 300 };
      const end = { x: 600, y: 300 };

      const normalBranch = generateLightningBranch(start, end, 555, false, 1);
      const empoweredBranch = generateLightningBranch(start, end, 555, true, 1);

      expect(empoweredBranch.forks.length).toBeGreaterThan(normalBranch.forks.length);
    });
  });

  describe('generateVerticalStrike', () => {
    it('should strike downwards to the target point', () => {
      const target = { x: 450, y: 380 };
      const strike = generateVerticalStrike(target, 123, true, 2);

      expect(strike.endPoint).toEqual(target);
      expect(strike.startPoint.y).toBeLessThan(target.y);
      expect(strike.mainD).toContain(`L ${target.x.toFixed(1)},${target.y.toFixed(1)}`);
    });
  });
});
