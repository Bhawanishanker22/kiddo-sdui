# kiddo — SDUI Homepage Renderer

React Native (Expo) implementation of a Server-Driven UI engine for a Q-commerce platform.

---

## Quick Start

```bash
npm install
npx expo start
```

---

## Architecture

### File Structure

```
src/
├── data/
│   └── homepagePayload.ts      # Mock SDUI JSON + 3 campaign presets
├── engine/
│   ├── types.ts                # All TypeScript interfaces (strict mode)
│   ├── componentRegistry.ts   # Hash-map Factory registry
│   ├── actionDispatcher.ts    # Universal Action Dispatcher
│   └── SDUIRenderer.tsx       # FlashList-based feed renderer
├── context/
│   ├── ThemeContext.tsx        # OTA runtime theming
│   ├── CartContext.tsx         # Split-context cart state
│   └── CampaignContext.tsx    # Campaign switching
└── components/
    ├── blocks/
    │   ├── BannerHero.tsx
    │   ├── ProductGrid2x2.tsx
    │   └── DynamicCollection.tsx
    └── common/
        ├── CampaignOverlay.tsx
        ├── CartBadge.tsx
        └── CampaignSwitcher.tsx
```

---

## Key Design Decisions

### A. Component Registry — Hash-Map, Not Switch

```typescript
const REGISTRY: ComponentRegistry = Object.freeze({
  BANNER_HERO: BannerHero,
  PRODUCT_GRID_2X2: ProductGrid2x2,
  DYNAMIC_COLLECTION: DynamicCollection,
});
```

O(1) lookup. Adding a new block type = one line in the registry object.
Unknown types return `null` — the renderer drops the node silently and continues.

### B. Resilience

`resolveComponentDynamic(blockType)` returns `null` for any unrecognized type.
`BlockItem` renders `null` when it receives `null` from the registry.
The surrounding FlashList is completely unaffected.

Tested with `{ type: "NEW_COMPONENT_V2", ... }` in the payload — it drops silently.

### C. Scroll Conflict Prevention (Horizontal in Vertical)

`DynamicCollection` uses:
- `directionalLockEnabled` — iOS: locks scroll axis on gesture start
- `getItemLayout` — avoids dynamic measurement, reduces bridge calls
- `decelerationRate="fast"` + `snapToInterval` — carousel feel without jank
- `maxToRenderPerBatch={4}`, `windowSize={5}` — tuned for narrow horizontal lists

### D. Cart State — Surgical Re-Renders

Cart context is split into two separate contexts:

| Context | Who reads it | Re-renders when |
|---|---|---|
| `CartStateContext` | `useCartItem(id)`, `useCartCount()` | Cart state changes |
| `CartDispatchContext` | `useCartDispatch()` | Never (stable refs) |

`useCartItem(id)` subscribes a card to ONLY its own item. When `grid_1` is added to cart, `grid_2`, `grid_3`, `grid_4` do not re-render.

`React.memo` on every block component prevents re-renders from unrelated context changes.

### E. OTA Theming

```
CampaignProvider
  → activeCampaign.theme_override
    → ThemeProvider (merges base + override)
      → All child components sample useTheme()
```

Switching campaigns updates the entire app's visual theme without any navigation or rebuild.

### F. Campaign Overlay

```tsx
<View style={StyleSheet.absoluteFill} pointerEvents="none">
  <LottieView source={{ uri: overlay.animation_url }} autoPlay loop />
</View>
```

`pointerEvents="none"` on the wrapper View ensures the Lottie layer is fully transparent to touch events. Users scroll, tap, and interact normally.

### G. Action Dispatcher

Decoupled from all UI. Components call:
```typescript
handleAction({ type: 'ADD_TO_CART', payload: { id, name, price } })
```

They never know what happens next. The dispatcher handles routing, validation, and error isolation. Unknown action types are logged in dev, silently dropped in prod.

---

## Campaign Presets

| Campaign | Theme | Animation |
|---|---|---|
| Back to School | Yellow + Blue | Paper airplanes (Lottie) |
| Summer Playhouse | Ocean Blue | Water splash (Lottie) |
| Mystery Carnival | Carnival Red | Confetti burst (Lottie) |

Use the `CampaignSwitcher` in the header to toggle between them at runtime.

---

## TypeScript

Strict mode enabled. Key type contracts:

- `SDUIBlock` — discriminated union of all known block types + `UnknownBlock`
- `ActionObject` — typed payload per action type
- `ThemeConfig` — full theme matrix
- `BlockComponentProps<TConfig>` — typed config per block renderer
- `ComponentRegistry` — `Readonly<Record<KnownBlockType, BlockRenderer>>`
