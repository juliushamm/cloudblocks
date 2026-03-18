import { create } from 'zustand'

interface UIState {
  view:            'topology' | 'graph'
  selectedNodeId:  string | null
  activeCreate:    { resource: string; view: 'topology' | 'graph'; dropPosition?: { x: number; y: number } } | null
  setView:         (view: 'topology' | 'graph') => void
  selectNode:      (id: string | null) => void
  setActiveCreate: (val: UIState['activeCreate']) => void
  showToast:       (message: string, type?: 'success' | 'error') => void
  clearToast:      () => void
  toast:           { message: string; type: 'success' | 'error' } | null
}

export const useUIStore = create<UIState>((set) => ({
  view:           'topology',
  selectedNodeId: null,
  activeCreate:   null,
  toast:          null,

  setView:         (view) => set({ view }),
  selectNode:      (id)   => set({ selectedNodeId: id }),
  setActiveCreate: (val)  => set({ activeCreate: val }),
  showToast: (message, type = 'success') => {
    set({ toast: { message, type } })
    setTimeout(() => set({ toast: null }), 2500)
  },
  clearToast: () => set({ toast: null }),
}))
