import { create } from 'zustand'
import type { WindowScene, SceneFormData } from '@/types'
import {
  getAllScenes,
  saveScene as storageSaveScene,
  deleteScene as storageDeleteScene,
  updateSceneTags as storageUpdateSceneTags,
  getAllRouteNames,
} from '@/services/storage'
import { filterScenes, pickRandomScene } from '@/utils/tagFilter'

interface SceneState {
  scenes: WindowScene[]
  routeNames: string[]
  selectedRoute: string
  randomScene: WindowScene | null

  loadAll: () => void
  saveScene: (data: SceneFormData) => void
  deleteScene: (id: string) => void
  selectRoute: (routeName: string) => void
  setSceneTags: (sceneId: string, tagIds: string[]) => void
  refreshRandom: (tagIds?: string[]) => void
}

export const useSceneStore = create<SceneState>((set) => ({
  scenes: [],
  routeNames: [],
  selectedRoute: '',
  randomScene: null,

  loadAll: () => {
    const scenes = getAllScenes()
    const routeNames = getAllRouteNames()
    set({ scenes, routeNames })
  },

  saveScene: (data: SceneFormData) => {
    const scene: WindowScene = {
      ...data,
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

  setSceneTags: (sceneId: string, tagIds: string[]) => {
    storageUpdateSceneTags(sceneId, tagIds)
    set({ scenes: getAllScenes() })
  },

  refreshRandom: (tagIds?: string[]) => {
    const pool = filterScenes(getAllScenes(), { tagIds })
    set({ randomScene: pickRandomScene(pool) })
  },
}))
