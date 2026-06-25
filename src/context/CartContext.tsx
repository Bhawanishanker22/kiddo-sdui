// ─────────────────────────────────────────────────────────────────────────────
// Cart Context
//
// RENDERING MANDATE: Mutating one product card's cart state must NOT
// re-render the other 30+ blocks in the vertical feed.
//
// Architecture:
// - CartProvider holds state and exposes stable dispatch + selector hooks
// - useCartCount() — subscribes ONLY to totalCount (e.g. header badge)
// - useIsInCart(id) — subscribes ONLY to one item (individual card buttons)
// - addToCart dispatch is stable (useCallback with no deps) — memo-safe
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  ReactNode,
} from 'react';
import { CartItem, CartState, AddToCartPayload } from '../engine/types';

// ── State & Reducer ───────────────────────────────────────────────────────────

type CartAction =
  | { type: 'ADD_ITEM'; payload: AddToCartPayload }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'CLEAR_CART' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { id, name, price, quantity = 1 } = action.payload;
      const existing = state.items[id];
      const newQty = (existing?.quantity ?? 0) + quantity;
      return {
        items: {
          ...state.items,
          [id]: { id, name, price, quantity: newQty },
        },
        totalCount: state.totalCount + quantity,
      };
    }
    case 'REMOVE_ITEM': {
      const item = state.items[action.id];
      if (!item) return state;
      const { [action.id]: _, ...rest } = state.items;
      return {
        items: rest,
        totalCount: Math.max(0, state.totalCount - item.quantity),
      };
    }
    case 'CLEAR_CART':
      return { items: {}, totalCount: 0 };
    default:
      return state;
  }
}

const INITIAL_STATE: CartState = { items: {}, totalCount: 0 };

// ── Split contexts to prevent unnecessary re-renders ─────────────────────────

// State context — components that need to READ cart
const CartStateContext = createContext<CartState>(INITIAL_STATE);

// Dispatch context — components that need to WRITE to cart
// Dispatch is stable across renders, so this context never triggers re-renders
interface CartDispatchContextValue {
  addToCart: (payload: AddToCartPayload) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}
const CartDispatchContext = createContext<CartDispatchContextValue>({
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, INITIAL_STATE);

  // Stable dispatch functions — these references never change
  const addToCart = useCallback((payload: AddToCartPayload) => {
    dispatch({ type: 'ADD_ITEM', payload });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', id });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const dispatchValue = useMemo(
    () => ({ addToCart, removeFromCart, clearCart }),
    [addToCart, removeFromCart, clearCart]
  );

  return (
    <CartDispatchContext.Provider value={dispatchValue}>
      <CartStateContext.Provider value={state}>
        {children}
      </CartStateContext.Provider>
    </CartDispatchContext.Provider>
  );
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

/**
 * Only subscribe to total cart count — for header badge.
 * Re-renders only when totalCount changes, not on every cart mutation.
 */
export function useCartCount(): number {
  return useContext(CartStateContext).totalCount;
}

/**
 * Only subscribe to a single item's quantity — for individual product buttons.
 * A card only re-renders when ITS item changes, not when other cards are updated.
 */
export function useCartItem(id: string): CartItem | undefined {
  return useContext(CartStateContext).items[id];
}

/**
 * Stable dispatch — components using ONLY this hook never re-render from cart state.
 */
export function useCartDispatch(): CartDispatchContextValue {
  return useContext(CartDispatchContext);
}

/**
 * Full cart state — use sparingly (e.g., Cart screen).
 */
export function useCartState(): CartState {
  return useContext(CartStateContext);
}
