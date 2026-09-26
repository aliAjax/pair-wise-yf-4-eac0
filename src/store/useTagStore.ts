import { create } from 'zustand'
import type { SceneTag } from '@/types'
import { getAllTags, createTag, updateTag, deleteTag } from '@/services/tagStorage'
import { removeTagFromAllScenes } from '@/services/storage'
import { useSceneStore } from '@/store/useSceneStore'

interface TagState {
  tags: SceneTag[]
  loadTags: () => void
  // 返回错误信息；null 表示成功
  addTag: (name: string, color: string) => string | null
  renameTag: (id: string, name: string, color: string) => string | null
  removeTag: (id: string) => void
}

export const useTagStore = create<TagState>((set) => ({
  tags: [],

  loadTags: () => {
    set({ tags: getAllTags() })
  },

  addTag: (name, color) => {
    try {
      createTag(name, color)
    } catch (e) {
      return e instanceof Error ? e.message : '标签保存失败'
    }
    set({ tags: getAllTags() })
    return null
  },

  renameTag: (id, name, color) => {
    try {
      updateTag(id, { name, color })
    } catch (e) {
      return e instanceof Error ? e.message : '标签保存失败'
    }
    set({ tags: getAllTags() })
    return null
  },

  removeTag: (id) => {
    deleteTag(id)
    // 记录只摘掉该标签，本身不删除
    removeTagFromAllScenes(id)
    set({ tags: getAllTags() })
    useSceneStore.getState().loadAll()
  },
}))
