// ─────────────────────────────────────────────────────────────────────────────
// Universal Action Dispatcher
// Atomic components call this with raw action objects — zero business logic leaks
// into UI components.
// ─────────────────────────────────────────────────────────────────────────────

import { Alert } from 'react-native';
import {
  ActionObject,
  AddToCartPayload,
  DeepLinkPayload,
  CouponPayload,
  BookingPayload,
} from './types';

// Injected dependencies to keep dispatcher pure and testable
export interface DispatcherDeps {
  addToCart: (item: AddToCartPayload) => void;
  navigate: (url: string) => void;
  applyCoupon?: (payload: CouponPayload) => void;
  openBooking?: (payload: BookingPayload) => void;
}

let _deps: DispatcherDeps | null = null;

/**
 * Register runtime dependencies once at app init.
 * Called inside CartProvider / NavigationProvider bootstraps.
 */
export function registerDispatcherDeps(deps: DispatcherDeps): void {
  _deps = deps;
}

/**
 * handleAction — the single entry point for all SDUI-driven interactions.
 *
 * Components call this with the raw server-provided action object.
 * They never know what happens next — pure inversion of control.
 */
export function handleAction(action: ActionObject): void {
  if (!_deps) {
    if (__DEV__) {
      console.warn('[ActionDispatcher] deps not registered yet. Dropping action:', action);
    }
    return;
  }

  try {
    switch (action.type) {
      case 'ADD_TO_CART': {
        const payload = action.payload as AddToCartPayload;
        if (!payload?.id || !payload?.name || payload?.price === undefined) {
          console.warn('[ActionDispatcher] ADD_TO_CART: malformed payload', payload);
          return;
        }
        _deps.addToCart({
          id: payload.id,
          name: payload.name,
          price: payload.price,
          quantity: payload.quantity ?? 1,
        });
        break;
      }

      case 'DEEP_LINK': {
        const payload = action.payload as DeepLinkPayload;
        if (!payload?.url) {
          console.warn('[ActionDispatcher] DEEP_LINK: missing url', payload);
          return;
        }
        _deps.navigate(payload.url);
        break;
      }

      case 'APPLY_MYSTERY_GIFT_COUPON': {
        const payload = action.payload as CouponPayload;
        if (_deps.applyCoupon) {
          _deps.applyCoupon(payload);
        } else {
          // Graceful fallback when feature is not yet wired up
          if (__DEV__) {
            console.log('[ActionDispatcher] APPLY_MYSTERY_GIFT_COUPON received, handler not registered.');
          }
        }
        break;
      }

      case 'OPEN_BOOKING': {
        const payload = action.payload as BookingPayload;
        if (_deps.openBooking) {
          _deps.openBooking(payload);
        } else {
          Alert.alert('Coming Soon', `Booking for "${payload?.event_name}" will be available soon!`);
        }
        break;
      }

      default: {
        // Unknown action types from server: log in dev, silent drop in prod
        if (__DEV__) {
          console.warn('[ActionDispatcher] Unrecognized action type:', action.type, action.payload);
        }
        break;
      }
    }
  } catch (err) {
    // Fault isolation — dispatcher errors must never crash the renderer
    console.error('[ActionDispatcher] Uncaught error dispatching action:', action, err);
  }
}
