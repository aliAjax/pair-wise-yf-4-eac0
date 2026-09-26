import type { WindowScene } from '@/types'

export interface SceneFilter {
  routeName?: string
  /** 多个标签为 AND 关系：记录必须同时挂有所选标签 */
  tagIds?: string[]
}

export function filterScenes(scenes: WindowScene[], filter: SceneFilter): WindowScene[] {
  const { routeName, tagIds } = filter
  return scenes.filter((scene) => {
    if (routeName && scene.routeName !== routeName) return false
    if (tagIds && tagIds.length > 0) {
      const own = scene.tagIds ?? []
      if (!tagIds.every((id) => own.includes(id))) return false
    }
    return true
  })
}

export function pickRandomScene(scenes: WindowScene[]): WindowScene | null {
  if (scenes.length === 0) return null
  return scenes[Math.floor(Math.random() * scenes.length)]
}
