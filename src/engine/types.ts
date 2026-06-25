// ─────────────────────────────────────────────────────────────────────────────
// SDUI Engine — Core Types
// ─────────────────────────────────────────────────────────────────────────────

// ── Action System ─────────────────────────────────────────────────────────────

export type ActionType =
  | 'ADD_TO_CART'
  | 'DEEP_LINK'
  | 'APPLY_MYSTERY_GIFT_COUPON'
  | 'OPEN_BOOKING'
  | string; // extensible for future server-pushed actions

export interface AddToCartPayload {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}

export interface DeepLinkPayload {
  url: string;
}

export interface CouponPayload {
  coupon_code: string;
  product_id?: string;
}

export interface BookingPayload {
  event_id: string;
  event_name: string;
}

export type ActionPayload =
  | AddToCartPayload
  | DeepLinkPayload
  | CouponPayload
  | BookingPayload
  | Record<string, unknown>;

export interface ActionObject {
  type: ActionType;
  payload: ActionPayload;
}

// ── Theme ─────────────────────────────────────────────────────────────────────

export interface ThemeConfig {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text_primary: string;
  text_secondary: string;
  accent: string;
  border_radius: number;
}

// ── Campaign ──────────────────────────────────────────────────────────────────

export interface OverlayConfig {
  type: 'FULL_SCREEN_OVERLAY';
  animation_url: string;
  animation_type: 'lottie' | 'webp' | 'gif';
}

export interface CampaignConfig {
  id: string;
  name: string;
  theme_override: ThemeConfig;
  overlay: OverlayConfig;
  active: boolean;
}

// ── Block Configs ─────────────────────────────────────────────────────────────

export interface BannerHeroConfig {
  image_url: string;
  title: string;
  subtitle: string;
  cta_label: string;
  badge_text?: string;
  action: ActionObject;
}

export interface ProductGridItem {
  id: string;
  image_url: string;
  name: string;
  price: string;
  original_price?: string;
  rating?: number;
  action: ActionObject;
}

export interface ProductGrid2x2Config {
  title: string;
  items: ProductGridItem[];
}

export interface DynamicCollectionItem {
  id: string;
  image_url: string;
  label: string;
  price: string;
  original_price?: string;
  badge?: string;
  action: ActionObject;
}

export interface DynamicCollectionConfig {
  title: string;
  subtitle?: string;
  theme_tag: string;
  items: DynamicCollectionItem[];
}

// ── Block Union Types ─────────────────────────────────────────────────────────

export type KnownBlockType =
  | 'BANNER_HERO'
  | 'PRODUCT_GRID_2X2'
  | 'DYNAMIC_COLLECTION';

export interface BannerHeroBlock {
  id: string;
  type: 'BANNER_HERO';
  config: BannerHeroConfig;
}

export interface ProductGrid2x2Block {
  id: string;
  type: 'PRODUCT_GRID_2X2';
  config: ProductGrid2x2Config;
}

export interface DynamicCollectionBlock {
  id: string;
  type: 'DYNAMIC_COLLECTION';
  config: DynamicCollectionConfig;
}

// Catch-all for unknown/future blocks — handled gracefully
export interface UnknownBlock {
  id: string;
  type: string;
  config: Record<string, unknown>;
}

export type SDUIBlock =
  | BannerHeroBlock
  | ProductGrid2x2Block
  | DynamicCollectionBlock
  | UnknownBlock;

// ── Root Payload ──────────────────────────────────────────────────────────────

export interface SDUIPayload {
  screen_id: string;
  theme: ThemeConfig;
  campaign?: CampaignConfig;
  blocks: SDUIBlock[];
}

// ── Cart State ────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartState {
  items: Record<string, CartItem>;
  totalCount: number;
}

// ── Component Registry ────────────────────────────────────────────────────────

import type { ComponentType } from 'react';

export type BlockComponentProps<TConfig = unknown> = {
  config: TConfig;
  blockId: string;
};

export type BlockRenderer = ComponentType<BlockComponentProps<any>>;

export type ComponentRegistry = Readonly<Record<KnownBlockType, BlockRenderer>>;
