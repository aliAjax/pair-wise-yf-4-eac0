import type { SceneTag } from '@/types'

const TAG_STORAGE_KEY = 'bus_window_scene_tags'

/** 首次使用时播种的默认分类，可被用户改名或移除 */
const DEFAULT_TAG_SEEDS = [
  { name: '城市招牌', color: '#E8945A' },
  { name: '人物气质', color: '#D98FB3' },
  { name: '自然气息', color: '#7FC8A9' },
]

function persist(tags: SceneTag[]): void {
  localStorage.setItem(TAG_STORAGE_KEY, JSON.stringify(tags))
}

function seedDefaultTags(): SceneTag[] {
  const tags: SceneTag[] = DEFAULT_TAG_SEEDS.map((seed) => ({
    ...seed,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }))
  persist(tags)
  return tags
}

export function getAllTags(): SceneTag[] {
  try {
    const raw = localStorage.getItem(TAG_STORAGE_KEY)
    // key 不存在说明从未初始化过；若用户删光了标签，key 仍在，不会重复播种
    if (raw === null) return seedDefaultTags()
    return JSON.parse(raw) as SceneTag[]
  } catch {
    return []
  }
}

function isNameTaken(tags: SceneTag[], name: string, excludeId?: string): boolean {
  const normalized = name.trim().toLowerCase()
  return tags.some((t) => t.id !== excludeId && t.name.toLowerCase() === normalized)
}

export function createTag(name: string, color: string): SceneTag {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('标签名不能为空')
  const tags = getAllTags()
  if (isNameTaken(tags, trimmed)) throw new Error('同名标签已存在')
  const tag: SceneTag = {
    id: crypto.randomUUID(),
    name: trimmed,
    color,
    createdAt: new Date().toISOString(),
  }
  persist([...tags, tag])
  return tag
}

export function updateTag(
  id: string,
  patch: { name?: string; color?: string }
): SceneTag | null {
  const tags = getAllTags()
  const index = tags.findIndex((t) => t.id === id)
  if (index === -1) return null

  const next = { ...patch }
  if (next.name !== undefined) {
    const trimmed = next.name.trim()
    if (!trimmed) throw new Error('标签名不能为空')
    if (isNameTaken(tags, trimmed, id)) throw new Error('同名标签已存在')
    next.name = trimmed
  }

  const updated: SceneTag = { ...tags[index], ...next }
  tags[index] = updated
  persist(tags)
  return updated
}

export function deleteTag(id: string): void {
  persist(getAllTags().filter((t) => t.id !== id))
}
