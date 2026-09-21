import { getSpriteFlipState } from './battle-character.component';

describe('BattleCharacter Sprite Facing and Status Rules', () => {
  describe('Sprite facing & flip states based on defaultFacing', () => {
    it('Case 1: should NOT flip when defaultFacing is right on left team (faces right)', () => {
      // Asset gốc quay phải ở team trái -> giữ nguyên để hướng về đối phương
      const shouldFlip = getSpriteFlipState('left', 'right');
      expect(shouldFlip).toBeFalse();
    });

    it('Case 2: should FLIP when defaultFacing is left on left team (faces right)', () => {
      // Asset gốc quay trái ở team trái -> cần lật scaleX(-1) để quay sang phải
      const shouldFlip = getSpriteFlipState('left', 'left');
      expect(shouldFlip).toBeTrue();
    });

    it('Case 3: should FLIP when defaultFacing is right on right team (faces left)', () => {
      // Asset gốc quay phải ở team phải -> cần lật scaleX(-1) để quay sang trái
      const shouldFlip = getSpriteFlipState('right', 'right');
      expect(shouldFlip).toBeTrue();
    });

    it('Case 4: should NOT flip when defaultFacing is left on right team (faces left)', () => {
      // Asset gốc quay trái ở team phải -> giữ nguyên để hướng về đối phương
      const shouldFlip = getSpriteFlipState('right', 'left');
      expect(shouldFlip).toBeFalse();
    });

    it('Fallback: should default to right facing when defaultFacing is undefined', () => {
      expect(getSpriteFlipState('left', undefined)).toBeFalse();
      expect(getSpriteFlipState('right', undefined)).toBeTrue();
    });
  });

  describe('HP and Mana percentage calculations at boundary values', () => {
    function calcPercentage(current: number, max: number): number {
      if (!max || max <= 0) return 0;
      return Math.min(100, Math.max(0, (current / max) * 100));
    }

    it('should correctly calculate HP at 0%', () => {
      expect(calcPercentage(0, 1000)).toBe(0);
    });

    it('should correctly calculate HP at 50%', () => {
      expect(calcPercentage(500, 1000)).toBe(50);
    });

    it('should correctly calculate HP at 100%', () => {
      expect(calcPercentage(1000, 1000)).toBe(100);
    });

    it('should correctly calculate Mana at 0%', () => {
      expect(calcPercentage(0, 100)).toBe(0);
    });

    it('should correctly calculate Mana at 50%', () => {
      expect(calcPercentage(50, 100)).toBe(50);
    });

    it('should correctly calculate Mana at 100%', () => {
      expect(calcPercentage(100, 100)).toBe(100);
    });
  });
});
