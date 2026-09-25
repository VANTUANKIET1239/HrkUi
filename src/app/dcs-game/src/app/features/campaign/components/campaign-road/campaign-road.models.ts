export interface RoadPoint {
  stageNumber: number;
  x: number; // ViewBox X (0..1000)
  y: number; // ViewBox Y (0..2400)
  xPercent: number; // 0..100%
  yPercent: number; // 0..100%
  isBoss: boolean;
  bossTier?: 'MINI_BOSS' | 'BOSS' | 'GRAND_BOSS';
}

export const ROAD_VIEWBOX = {
  width: 1000,
  height: 2400
};

// 15 Stage Normalized Path Coordinates (Ascending from 1 at bottom to 15 at summit)
export const STAGE_COORDINATES: RoadPoint[] = [
  { stageNumber: 1,  x: 500, y: 2260, xPercent: 50.0, yPercent: 94.17, isBoss: false },
  { stageNumber: 2,  x: 280, y: 2090, xPercent: 28.0, yPercent: 87.08, isBoss: false },
  { stageNumber: 3,  x: 170, y: 1920, xPercent: 17.0, yPercent: 80.00, isBoss: false },
  { stageNumber: 4,  x: 340, y: 1750, xPercent: 34.0, yPercent: 72.92, isBoss: false },
  { stageNumber: 5,  x: 580, y: 1600, xPercent: 58.0, yPercent: 66.67, isBoss: true, bossTier: 'MINI_BOSS' },
  { stageNumber: 6,  x: 780, y: 1450, xPercent: 78.0, yPercent: 60.42, isBoss: false },
  { stageNumber: 7,  x: 850, y: 1290, xPercent: 85.0, yPercent: 53.75, isBoss: false },
  { stageNumber: 8,  x: 700, y: 1130, xPercent: 70.0, yPercent: 47.08, isBoss: false },
  { stageNumber: 9,  x: 460, y: 980,  xPercent: 46.0, yPercent: 40.83, isBoss: false },
  { stageNumber: 10, x: 230, y: 830,  xPercent: 23.0, yPercent: 34.58, isBoss: true, bossTier: 'BOSS' },
  { stageNumber: 11, x: 150, y: 660,  xPercent: 15.0, yPercent: 27.50, isBoss: false },
  { stageNumber: 12, x: 350, y: 510,  xPercent: 35.0, yPercent: 21.25, isBoss: false },
  { stageNumber: 13, x: 630, y: 370,  xPercent: 63.0, yPercent: 15.42, isBoss: false },
  { stageNumber: 14, x: 810, y: 230,  xPercent: 81.0, yPercent: 9.58,  isBoss: false },
  { stageNumber: 15, x: 500, y: 90,   xPercent: 50.0, yPercent: 3.75,  isBoss: true, bossTier: 'GRAND_BOSS' }
];

/**
 * Generates a smooth cubic Bezier SVG path through the given list of points.
 * Uses Catmull-Rom to Cubic Bezier conversion for ultra-smooth S-curve interpolation.
 */
export function buildSmoothSvgPath(points: { x: number; y: number }[]): string {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    // Catmull-Rom to Bezier control points with tension factor ~ 0.5
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}
