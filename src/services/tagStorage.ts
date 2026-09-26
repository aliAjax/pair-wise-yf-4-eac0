import type { SceneTag } from '@/types'

const TAG_STORAGE_KEY = 'bus_window_tags'

export const TAG_COLORS = [
  '#E8945A',
  '#E86A6A',
  '#D9C53A',
  '#6ABF69',
  '#4EC9B0',
  '#5AA9E8',
  '#B07FE8',
  '#E87FB8',
]

const DEFAULT_TAGS: Array<Omit<SceneTag, 'id'>> = [
  { name: '城市招牌', color: '#E8945A' },
  { name: '人物气质', color: '#B07FE8' },
  { name: '自然气息', color: '#6ABF69' },
]

function persist(tags: SceneTag[]): void {
  localStorage.setItem(TAG_STORAGE_KEY, JSON.stringify(tags))
}

export function getAllTags(): SceneTag[] {
  try {
    const raw = localStorage.getItem(TAG_STORAGE_KEY)
    if (raw === null) {
      // 首次使用才写入默认标签；用户删光后不再重复生成
      const seeded = DEFAULT_TAGS.map((t) => ({ ...t, id: crypto.randomUUID() }))
      persist(seeded)
      return seeded
    }
    return JSON.parse(raw) as SceneTag[]
  } catch {
    return []
  }
}

function assertNameAvailable(name: string, excludeId?: string): string {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('标签名不能为空')
  const duplicated = getAllTags().some((t) => t.name === trimmed && t.id !== excludeId)
  if (duplicated) throw new Error('同名标签已存在')
  return trimmed
}

export function createTag(name: string, color: string): SceneTag {
  const tag: SceneTag = { id: crypto.randomUUID(), name: assertNameAvailable(name), color }
  persist([...getAllTags(), tag])
  return tag
}

export function updateTag(id: string, updates: { name: string; color: string }): SceneTag {
  const name = assertNameAvailable(updates.name, id)
  const tags = getAllTags()
  const index = tags.findIndex((t) => t.id === id)
  if (index === -1) throw new Error('标签不存在')
  // 记录只存标签 id，改名/换色后已有记录自动跟随，无需逐条改写
  const updated: SceneTag = { ...tags[index], name, color: updates.color }
  tags[index] = updated
  persist(tags)
  return updated
}

export function deleteTag(id: string): void {
  persist(getAllTags().filter((t) => t.id !== id))
}
