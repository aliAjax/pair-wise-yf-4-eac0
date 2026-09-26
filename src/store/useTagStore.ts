import { create } from 'zustand'
import type { SceneTag } from '@/types'
import {
  getAllTags,
  createTag as storageCreateTag,
  updateTag as storageUpdateTag,
  deleteTag as storageDeleteTag,
} from '@/services/tagStorage'
import { removeTagFromScenes } from '@/services/storage'

interface TagState {
  tags: SceneTag[]

  loadTags: () => void
  /** 成功返回 null，失败返回错误信息（如重名） */
  createTag: (name: string, color: string) => string | null
  renameTag: (id: string, name: string) => string | null
  recolorTag: (id: string, color: string) => void
  removeTag: (id: string) => void
}

export const useTagStore = create<TagState>((set) => ({
  tags: [],

  loadTags: () => {
    set({ tags: getAllTags() })
  },

  createTag: (name, color) => {
    try {
      storageCreateTag(name, color)
    } catch (err) {
      return err instanceof Error ? err.message : '创建标签失败'
    }
    set({ tags: getAllTags() })
    return null
  },

  renameTag: (id, name) => {
    try {
      storageUpdateTag(id, { name })
    } catch (err) {
      return err instanceof Error ? err.message : '改名失败'
    }
    // 记录按 id 引用标签，改名后已有记录自动跟随，无需改动
    set({ tags: getAllTags() })
    return null
  },

  recolorTag: (id, color) => {
    storageUpdateTag(id, { color })
    set({ tags: getAllTags() })
  },

  removeTag: (id) => {
    storageDeleteTag(id)
    // 从已有记录上摘下该标签，记录本身不删除
    removeTagFromScenes(id)
    set({ tags: getAllTags() })
  },
}))
