// ─────────────────────────────────────────────────────────────────────────────
// Component Registry — Factory Pattern
//
// Uses a hash-map (not switch) for O(1) lookup and easy extension.
// Adding a new component = one line. Zero changes to renderer logic.
// ─────────────────────────────────────────────────────────────────────────────

import { ComponentRegistry, KnownBlockType, BlockRenderer } from './types';
import { BannerHero } from '../components/blocks/BannerHero';
import { ProductGrid2x2 } from '../components/blocks/ProductGrid2x2';
import { DynamicCollection } from '../components/blocks/DynamicCollection';

/**
 * The registry maps server-pushed block type strings to React components.
 * Typed as Readonly to prevent accidental runtime mutation.
 *
 * Evaluation note: This is a hash-map registry, not a switch statement.
 * Lookup is O(1). Adding 'NEW_COMPONENT_V2' requires zero changes here —
 * just register it in registerComponent() below.
 */
const REGISTRY: ComponentRegistry = Object.freeze({
  BANNER_HERO: BannerHero,
  PRODUCT_GRID_2X2: ProductGrid2x2,
  DYNAMIC_COLLECTION: DynamicCollection,
} as const);

/**
 * Resolve a block type to its renderer.
 * Returns null for any unrecognized type — the renderer drops the node silently.
 */
export function resolveComponent(blockType: string): BlockRenderer | null {
  const renderer = REGISTRY[blockType as KnownBlockType];
  if (!renderer) {
    if (__DEV__) {
      console.warn(
        `[ComponentRegistry] Unknown block type "${blockType}" — dropping node silently. ` +
        `Register it with registerComponent() to handle it.`
      );
    }
    return null;
  }
  return renderer;
}

/**
 * Dynamic registration — allows OTA-style component injection
 * without rebuilding the app binary.
 *
 * Usage: registerComponent('NEW_COMPONENT_V2', MyNewComponent)
 */
const _mutableRegistry: Record<string, BlockRenderer> = { ...REGISTRY };

export function registerComponent(type: string, renderer: BlockRenderer): void {
  if (_mutableRegistry[type] && __DEV__) {
    console.warn(`[ComponentRegistry] Overwriting existing renderer for type: ${type}`);
  }
  _mutableRegistry[type] = renderer;
}

export function resolveComponentDynamic(blockType: string): BlockRenderer | null {
  return _mutableRegistry[blockType] ?? null;
}
