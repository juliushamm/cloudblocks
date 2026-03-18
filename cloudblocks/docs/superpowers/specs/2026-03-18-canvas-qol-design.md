# Canvas QoL — Panning & Persistent Node Positions

## Goal

Fix unreliable canvas panning and make node positions persist across re-scans.

## Problem

1. `fitView` prop on both ReactFlow instances re-fits the viewport on every render, fighting manual panning.
2. No `panOnScroll` — trackpad two-finger scroll zooms instead of panning.
3. Node positions are fully recomputed every render — manual drags are discarded immediately.

## Architecture

### Panning fixes (TopologyView + GraphView)

- Remove `fitView` prop from both `<ReactFlow>` instances.
- Add `panOnScroll={true}` for natural trackpad two-finger panning.
- Add `minZoom={0.1}` and `maxZoom={2}` to prevent getting lost at extreme zoom levels.
- Add a `useEffect` in each view that calls `fitView()` once when nodes transition from 0 → N (first load). Subsequent scans do not move the camera.

### Position persistence (UIStore)

Add to `useUIStore`:
- `nodePositions: Record<string, { x: number; y: number }>` — override map, starts empty.
- `setNodePosition(id: string, pos: { x: number; y: number })` — saves a position.

Both views:
- Wire `onNodesChange` — extract `type === 'position'` events, call `setNodePosition`.
- Positions are saved in the node's own coordinate space (relative to parent for child nodes), which is exactly what React Flow fires in change events — so restoring them works correctly without coordinate conversion.
- When building `flowNodes`, check `nodePositions[n.id]` first; fall back to computed position if no override exists.

Positions are stored in memory only (reset on app restart). Stale entries for deleted nodes stay in the map — harmless.

## Components Modified

- `src/renderer/store/ui.ts` — add `nodePositions`, `setNodePosition`
- `src/renderer/components/canvas/TopologyView.tsx` — panning config, position overrides, one-time fitView
- `src/renderer/components/canvas/GraphView.tsx` — same as TopologyView

## Testing

New test file `src/renderer/store/__tests__/ui.test.ts` (alongside existing store tests):
- `setNodePosition` saves correct id/coords to `nodePositions`.
- Position override takes precedence over computed position in `flowNodes`.

New test file `src/renderer/components/canvas/__tests__/GraphView.test.tsx`:
- `fitView` is NOT called on scan update, only on first node load (0→N transition).
