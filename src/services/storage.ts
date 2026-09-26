import type { WindowScene } from '@/types'

const STORAGE_KEY = 'bus_window_scenes'

export function getAllScenes(): WindowScene[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as WindowScene[]
  } catch {
    return []
  }
}

export function saveScene(scene: WindowScene): void {
  const scenes = getAllScenes()
  scenes.push(scene)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenes))
}

export function deleteScene(id: string): void {
  const scenes = getAllScenes().filter((s) => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenes))
}

/** 标签被移除后，从所有记录上摘下该标签；记录本身保留 */
export function removeTagFromScenes(tagId: string): void {
  const scenes = getAllScenes()
  let changed = false
  const next = scenes.map((scene) => {
    if (!scene.tagIds?.includes(tagId)) return scene
    changed = true
    return { ...scene, tagIds: scene.tagIds.filter((id) => id !== tagId) }
  })
  if (changed) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
}

export function getAllRouteNames(): string[] {
  const scenes = getAllScenes()
  const routeSet = new Set(scenes.map((s) => s.routeName))
  return Array.from(routeSet).sort()
}
