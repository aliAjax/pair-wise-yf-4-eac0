import { create } from 'zustand'
import type { WindowScene, SceneFormData } from '@/types'
import {
  getAllScenes,
  saveScene as storageSaveScene,
  deleteScene as storageDeleteScene,
  getAllRouteNames,
} from '@/services/storage'
import { getAllTags } from '@/services/tagStorage'
import { filterScenes, pickRandomScene } from '@/utils/sceneFilter'

interface SceneState {
  scenes: WindowScene[]
  routeNames: string[]
  selectedRoute: string
  selectedTagIds: string[]
  randomScene: WindowScene | null

  loadAll: () => void
  saveScene: (data: SceneFormData) => void
  deleteScene: (id: string) => void
  selectRoute: (routeName: string) => void
  toggleTagFilter: (tagId: string) => void
  clearTagFilters: () => void
  refreshRandom: (tagIds?: string[]) => void
}

export const useSceneStore = create<SceneState>((set) => ({
  scenes: [],
  routeNames: [],
  selectedRoute: '',
  selectedTagIds: [],
  randomScene: null,

  loadAll: () => {
    set({ scenes: getAllScenes(), routeNames: getAllRouteNames() })
  },

  saveScene: (data: SceneFormData) => {
    // 只保留仍然存在的标签，避免悬挂引用
    const validTagIds = new Set(getAllTags().map((t) => t.id))
    const scene: WindowScene = {
      ...data,
      tagIds: (data.tagIds ?? []).filter((id) => validTagIds.has(id)),
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    }
    storageSaveScene(scene)
    set({ scenes: getAllScenes(), routeNames: getAllRouteNames() })
  },

  deleteScene: (id: string) => {
    storageDeleteScene(id)
    set({ scenes: getAllScenes(), routeNames: getAllRouteNames() })
  },

  selectRoute: (routeName: string) => {
    set({ selectedRoute: routeName })
  },

  toggleTagFilter: (tagId: string) => {
    set((state) => ({
      selectedTagIds: state.selectedTagIds.includes(tagId)
        ? state.selectedTagIds.filter((id) => id !== tagId)
        : [...state.selectedTagIds, tagId],
    }))
  },

  clearTagFilters: () => {
    set({ selectedTagIds: [] })
  },

  refreshRandom: (tagIds?: string[]) => {
    const pool = filterScenes(getAllScenes(), { tagIds })
    set({ randomScene: pickRandomScene(pool) })
  },
}))
