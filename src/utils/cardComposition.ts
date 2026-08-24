import { Game } from '../types/game';
import { CardLayoutConfig } from '../components/games/ScatteredGameCard';

export interface DeviceLayoutConfig {
  rotation: number;
  scale: number;
  zIndex: number;
  leftPercent?: number;
  topPercent?: number;
  widthPercent?: number;
  xOffsetPx?: number;
  yOffsetPx?: number;
}

export interface DeterministicCardLayout {
  game: Game;
  index: number;
  clusterIndex: number;
  clusterItemIndex: number;
  desktop: DeviceLayoutConfig;
  mobile: DeviceLayoutConfig;
}

export interface GameCluster {
  clusterIndex: number;
  games: DeterministicCardLayout[];
  canvasHeight: string;
  presetName: 'alpha' | 'beta' | 'compact-1' | 'compact-2' | 'compact-3' | 'compact-4';
}

/**
 * 7-Card Preset Alpha: Dynamic scattered layout with central focus
 */
export const CLUSTER_PRESET_ALPHA: DeviceLayoutConfig[] = [
  // 0: Top Left tilted counter-clockwise
  {
    rotation: -5.5,
    scale: 1.02,
    zIndex: 14,
    leftPercent: 2,
    topPercent: 2,
    widthPercent: 46,
    xOffsetPx: 0,
    yOffsetPx: 0,
  },
  // 1: Top Right tilted clockwise
  {
    rotation: 4.5,
    scale: 0.97,
    zIndex: 16,
    leftPercent: 52,
    topPercent: 0,
    widthPercent: 46,
    xOffsetPx: 0,
    yOffsetPx: 0,
  },
  // 2: Central Dominant Hero card overlapping cards 0 & 1
  {
    rotation: -1.5,
    scale: 1.10,
    zIndex: 30,
    leftPercent: 22,
    topPercent: 26,
    widthPercent: 56,
    xOffsetPx: 0,
    yOffsetPx: 0,
  },
  // 3: Mid-Left sitting beneath center
  {
    rotation: 5.0,
    scale: 0.98,
    zIndex: 18,
    leftPercent: 1,
    topPercent: 52,
    widthPercent: 45,
    xOffsetPx: 0,
    yOffsetPx: 0,
  },
  // 4: Mid-Right tilted back
  {
    rotation: -6.0,
    scale: 1.04,
    zIndex: 20,
    leftPercent: 53,
    topPercent: 53,
    widthPercent: 46,
    xOffsetPx: 0,
    yOffsetPx: 0,
  },
  // 5: Lower Center-Left
  {
    rotation: -3.5,
    scale: 0.96,
    zIndex: 24,
    leftPercent: 8,
    topPercent: 76,
    widthPercent: 46,
    xOffsetPx: 0,
    yOffsetPx: 0,
  },
  // 6: Lower Center-Right overlapping card 5
  {
    rotation: 4.0,
    scale: 1.02,
    zIndex: 26,
    leftPercent: 48,
    topPercent: 77,
    widthPercent: 48,
    xOffsetPx: 0,
    yOffsetPx: 0,
  },
];

/**
 * 7-Card Preset Beta: Mirrored & alternate focal layout for seamless scrolling compositions
 */
export const CLUSTER_PRESET_BETA: DeviceLayoutConfig[] = [
  // 0: Top Right tilted
  {
    rotation: -4.5,
    scale: 1.05,
    zIndex: 16,
    leftPercent: 50,
    topPercent: 1,
    widthPercent: 47,
    xOffsetPx: 0,
    yOffsetPx: 0,
  },
  // 1: Top Left wide
  {
    rotation: 3.5,
    scale: 0.98,
    zIndex: 14,
    leftPercent: 2,
    topPercent: 3,
    widthPercent: 46,
    xOffsetPx: 0,
    yOffsetPx: 0,
  },
  // 2: Center-Right focal card
  {
    rotation: 2.0,
    scale: 1.08,
    zIndex: 30,
    leftPercent: 25,
    topPercent: 27,
    widthPercent: 55,
    xOffsetPx: 0,
    yOffsetPx: 0,
  },
  // 3: Mid-Left overlapping
  {
    rotation: -5.0,
    scale: 0.96,
    zIndex: 18,
    leftPercent: 3,
    topPercent: 51,
    widthPercent: 45,
    xOffsetPx: 0,
    yOffsetPx: 0,
  },
  // 4: Mid-Right
  {
    rotation: 4.5,
    scale: 1.02,
    zIndex: 20,
    leftPercent: 52,
    topPercent: 54,
    widthPercent: 46,
    xOffsetPx: 0,
    yOffsetPx: 0,
  },
  // 5: Lower Left
  {
    rotation: -2.5,
    scale: 1.01,
    zIndex: 25,
    leftPercent: 12,
    topPercent: 75,
    widthPercent: 48,
    xOffsetPx: 0,
    yOffsetPx: 0,
  },
  // 6: Lower Right edge
  {
    rotation: 5.5,
    scale: 0.95,
    zIndex: 22,
    leftPercent: 52,
    topPercent: 78,
    widthPercent: 45,
    xOffsetPx: 0,
    yOffsetPx: 0,
  },
];

/**
 * Mobile stagger rotation cycle for natural portrait deck stacking
 */
export const MOBILE_STAGGER_ROTATIONS = [-2.5, 2.0, -1.8, 2.5, -2.0, 1.5, -1.0, 2.2];

/**
 * Computes deterministic pseudorandom hash from string for stable micro-variations if needed
 */
export function getDeterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get canvas container height based on the number of items in a cluster
 */
export function getClusterCanvasHeight(count: number): string {
  if (count === 1) return '480px';
  if (count === 2) return '560px';
  if (count <= 4) return '980px';
  if (count <= 6) return '1250px';
  return '1450px';
}

/**
 * Maps raw game items to deterministic layout properties for desktop and mobile devices.
 * Ensures the composition remains stable, reproducible, and visually balanced.
 */
export function mapGamesToDeterministicLayout(games: Game[], chunkSize = 7): DeterministicCardLayout[] {
  return games.map((game, index) => {
    const clusterIndex = Math.floor(index / chunkSize);
    const clusterItemIndex = index % chunkSize;
    const isPresetAlpha = clusterIndex % 2 === 0;
    const preset = isPresetAlpha ? CLUSTER_PRESET_ALPHA : CLUSTER_PRESET_BETA;

    // Desktop Layout assignment
    const desktopBase = preset[clusterItemIndex] || preset[clusterItemIndex % preset.length];
    
    // Mobile Layout assignment
    const mobileRotation = MOBILE_STAGGER_ROTATIONS[index % MOBILE_STAGGER_ROTATIONS.length];
    const mobileZIndex = 20 + (index % 10);

    return {
      game,
      index,
      clusterIndex,
      clusterItemIndex,
      desktop: {
        ...desktopBase,
      },
      mobile: {
        rotation: mobileRotation,
        scale: 0.98,
        zIndex: mobileZIndex,
        xOffsetPx: index % 2 === 0 ? -4 : 4,
        yOffsetPx: 0,
      },
    };
  });
}

/**
 * Groups deterministic game card layouts into clustered canvases for rendering
 */
export function groupGamesIntoClusters(games: Game[], chunkSize = 7): GameCluster[] {
  const mapped = mapGamesToDeterministicLayout(games, chunkSize);
  const clusterMap = new Map<number, DeterministicCardLayout[]>();

  mapped.forEach((item) => {
    const list = clusterMap.get(item.clusterIndex) || [];
    list.push(item);
    clusterMap.set(item.clusterIndex, list);
  });

  const clusters: GameCluster[] = [];
  clusterMap.forEach((clusterGames, clusterIndex) => {
    const count = clusterGames.length;
    const isPresetAlpha = clusterIndex % 2 === 0;

    let presetName: GameCluster['presetName'] = isPresetAlpha ? 'alpha' : 'beta';
    if (count === 1) presetName = 'compact-1';
    else if (count === 2) presetName = 'compact-2';
    else if (count === 3) presetName = 'compact-3';
    else if (count === 4) presetName = 'compact-4';

    clusters.push({
      clusterIndex,
      games: clusterGames,
      canvasHeight: getClusterCanvasHeight(count),
      presetName,
    });
  });

  return clusters;
}
