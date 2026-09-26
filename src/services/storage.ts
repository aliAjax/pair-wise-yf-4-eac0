import type { WindowScene } from '@/types'
import { getAllTags } from '@/services/tagStorage'

const STORAGE_KEY = 'bus_window_scenes'

// 兼容旧记录：没有 tagIds 字段时按空数组处理
function normalize(scene: WindowScene): WindowScene {
  return { ...scene, tagIds: scene.tagIds ?? [] }
}

export function getAllScenes(): WindowScene[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return (JSON.parse(raw) as WindowScene[]).map(normalize)
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

export function updateSceneTags(id: string, tagIds: string[]): void {
  const validIds = new Set(getAllTags().map((t) => t.id))
  const cleaned = tagIds.filter((tagId) => validIds.has(tagId))
  const scenes = getAllScenes().map((s) => (s.id === id ? { ...s, tagIds: cleaned } : s))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenes))
}

// 删除标签时调用：只把标签从各条记录上取下，记录本身保留
export function removeTagFromAllScenes(tagId: string): void {
  const scenes = getAllScenes()
  if (!scenes.some((s) => s.tagIds?.includes(tagId))) return
  const next = scenes.map((s) =>
    s.tagIds?.includes(tagId) ? { ...s, tagIds: s.tagIds.filter((id) => id !== tagId) } : s
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function getAllRouteNames(): string[] {
  const scenes = getAllScenes()
  const routeSet = new Set(scenes.map((s) => s.routeName))
  return Array.from(routeSet).sort()
}
