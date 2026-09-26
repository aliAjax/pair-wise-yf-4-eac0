import { useEffect, useState } from 'react'
import { X, Plus, Pencil, Check, Trash2, Tags } from 'lucide-react'
import { useTagStore } from '@/store/useTagStore'
import { useSceneStore } from '@/store/useSceneStore'
import { TAG_COLORS } from '@/utils/tagHelpers'

interface TagManagerModalProps {
  open: boolean
  onClose: () => void
}

export default function TagManagerModal({ open, onClose }: TagManagerModalProps) {
  const { tags, loadTags, createTag, renameTag, recolorTag, removeTag } = useTagStore()
  const scenes = useSceneStore((s) => s.scenes)
  const loadAllScenes = useSceneStore((s) => s.loadAll)

  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState<string>(TAG_COLORS[0].value)
  const [createError, setCreateError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editError, setEditError] = useState('')
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  useEffect(() => {
    if (open) loadTags()
  }, [open, loadTags])

  if (!open) return null

  const usageCount = (tagId: string) =>
    scenes.reduce((n, s) => n + (s.tagIds?.includes(tagId) ? 1 : 0), 0)

  const handleCreate = () => {
    const error = createTag(newName, newColor)
    if (error) {
      setCreateError(error)
      return
    }
    setNewName('')
    setCreateError('')
  }

  const startEdit = (id: string, name: string) => {
    setEditingId(id)
    setEditName(name)
    setEditError('')
    setConfirmingId(null)
  }

  const handleRename = () => {
    if (!editingId) return
    const error = renameTag(editingId, editName)
    if (error) {
      setEditError(error)
      return
    }
    setEditingId(null)
    setEditError('')
  }

  const handleDelete = (id: string) => {
    removeTag(id)
    // 记录上的该标签已被摘下，刷新场景缓存让页面同步
    loadAllScenes()
    setConfirmingId(null)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-md animate-scale-in rounded-2xl border border-teal-700 bg-teal-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-mist-400 hover:text-mist-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4 flex items-center gap-2">
          <Tags className="w-5 h-5 text-dusk-400" />
          <h2 className="text-xl font-bold text-dusk-400 font-serif">标签管理</h2>
        </div>

        <div className="mb-5 space-y-2">
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="新标签名，如：城市招牌"
              className="flex-1 rounded-lg border border-teal-800 bg-teal-850 px-3 py-2 text-sm text-mist-100 placeholder:text-mist-500 focus:border-dusk-400 focus:outline-none"
            />
            <button
              onClick={handleCreate}
              className="flex items-center gap-1 rounded-lg bg-dusk-400 px-3 py-2 text-sm text-teal-950 transition-colors hover:bg-dusk-300"
            >
              <Plus className="w-4 h-4" />
              添加
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            {TAG_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.label}
                onClick={() => setNewColor(c.value)}
                style={{ backgroundColor: c.value }}
                className={`h-6 w-6 rounded-full border-2 transition ${
                  newColor === c.value ? 'scale-110 border-mist-100' : 'border-transparent'
                }`}
              />
            ))}
          </div>
          {createError && <p className="text-xs text-red-300">{createError}</p>}
        </div>

        <div className="max-h-64 space-y-2 overflow-y-auto">
          {tags.length === 0 && (
            <p className="py-6 text-center text-sm text-mist-500">还没有标签，先创建一个吧</p>
          )}
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="rounded-xl border border-teal-800 bg-teal-850/60 px-3 py-2"
            >
              {editingId === tag.id ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                      autoFocus
                      className="flex-1 rounded-lg border border-teal-700 bg-teal-850 px-2.5 py-1.5 text-sm text-mist-100 focus:border-dusk-400 focus:outline-none"
                    />
                    <button
                      onClick={handleRename}
                      className="flex items-center gap-1 rounded-lg bg-dusk-400 px-2.5 py-1.5 text-xs text-teal-950 hover:bg-dusk-300"
                    >
                      <Check className="w-3.5 h-3.5" />
                      保存
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-lg bg-teal-800 px-2.5 py-1.5 text-xs text-mist-300 hover:bg-teal-700"
                    >
                      取消
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {TAG_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        title={c.label}
                        onClick={() => recolorTag(tag.id, c.value)}
                        style={{ backgroundColor: c.value }}
                        className={`h-5 w-5 rounded-full border-2 transition ${
                          tag.color === c.value ? 'scale-110 border-mist-100' : 'border-transparent'
                        }`}
                      />
                    ))}
                  </div>
                  {editError && <p className="text-xs text-red-300">{editError}</p>}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="flex-1 truncate text-sm text-mist-100">{tag.name}</span>
                  <span className="shrink-0 text-[10px] text-mist-500">
                    {usageCount(tag.id)} 条记录
                  </span>
                  {confirmingId === tag.id ? (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => handleDelete(tag.id)}
                        className="rounded bg-red-900/50 px-2 py-1 text-[10px] text-red-300 hover:bg-red-900/70"
                      >
                        确认移除
                      </button>
                      <button
                        onClick={() => setConfirmingId(null)}
                        className="rounded bg-teal-800 px-2 py-1 text-[10px] text-mist-300 hover:bg-teal-700"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => startEdit(tag.id, tag.name)}
                        className="rounded p-1.5 text-mist-400 hover:bg-teal-800 hover:text-mist-100"
                        title="改名 / 换色"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setConfirmingId(tag.id)
                          setEditingId(null)
                        }}
                        className="rounded p-1.5 text-mist-400 hover:bg-red-900/40 hover:text-red-300"
                        title="移除标签"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-mist-500">
          改名会自动同步到已挂的记录；移除标签只会把它从记录上取下，记录本身保留。
        </p>
      </div>
    </div>
  )
}
