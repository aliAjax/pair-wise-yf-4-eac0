import type { SceneTag, WindowScene } from '@/types'

export interface SceneFilter {
  routeName?: string
  tagIds?: string[]
}

// 路线与标签之间、以及多个标签之间均为「且」的关系：
// 同时选中路线和多个标签时，只保留全部条件都符合的记录
export function filterScenes(scenes: WindowScene[], filter: SceneFilter): WindowScene[] {
  const { routeName, tagIds } = filter
  return scenes.filter((scene) => {
    if (routeName && scene.routeName !== routeName) return false
    if (tagIds && tagIds.length > 0) {
      const owned = scene.tagIds ?? []
      if (!tagIds.every((id) => owned.includes(id))) return false
    }
    return true
  })
}

export function pickRandomScene(scenes: WindowScene[]): WindowScene | null {
  if (scenes.length === 0) return null
  return scenes[Math.floor(Math.random() * scenes.length)]
}

// 解析记录实际拥有的标签，自动跳过已删除的标签 id
export function getSceneTags(scene: WindowScene, allTags: SceneTag[]): SceneTag[] {
  const ids = scene.tagIds ?? []
  return ids
    .map((id) => allTags.find((t) => t.id === id))
    .filter((t): t is SceneTag => Boolean(t))
}
