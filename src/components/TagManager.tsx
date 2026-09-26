import { useState } from 'react'
import { X, Plus, Pencil, Trash2, Check } from 'lucide-react'
import { useTagStore } from '@/store/useTagStore'
import { TAG_COLORS } from '@/services/tagStorage'

interface TagManagerProps {
  open: boolean
  onClose: () => void
}

function ColorSwatches({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TAG_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-label={`选择颜色 ${c}`}
          className="h-6 w-6 rounded-full transition-transform"
          style={{
            backgroundColor: c,
            boxShadow: value === c ? `0 0 0 2px #0F1B24, 0 0 0 4px ${c}` : undefined,
          }}
        />
      ))}
    </div>
  )
}

export default function TagManager({ open, onClose }: TagManagerProps) {
  const { tags, addTag, renameTag, removeTag } = useTagStore()
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(TAG_COLORS[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [error, setError] = useState('')

  if (!open) return null

  const handleAdd = () => {
    const err = addTag(newName, newColor)
    if (err) {
      setError(err)
      return
    }
    setError('')
    setNewName('')
  }

  const startEdit = (id: string) => {
    const tag = tags.find((t) => t.id === id)
    if (!tag) return
    setEditingId(id)
    setEditName(tag.name)
    setEditColor(tag.color)
    setConfirmId(null)
    setError('')
  }

  const handleRename = () => {
    if (!editingId) return
    const err = renameTag(editingId, editName, editColor)
    if (err) {
      setError(err)
      return
    }
    setError('')
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    if (confirmId !== id) {
      setConfirmId(id)
      return
    }
    removeTag(id)
    if (editingId === id) setEditingId(null)
    setConfirmId(null)
    setError('')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 flex max-h-[85vh] w-full max-w-md animate-scale-in flex-col rounded-2xl border border-teal-700 bg-teal-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-mist-400 transition-colors hover:text-mist-100"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-4 font-serif text-xl font-bold text-dusk-400">标签管理</h2>

        <div className="mb-4 space-y-3 rounded-xl border border-teal-800 p-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="新标签名称，如：黄昏光线"
            className="w-full rounded-lg bg-teal-850 px-3 py-2 text-sm text-mist-100 outline-none focus:ring-1 focus:ring-dusk-400"
          />
          <ColorSwatches value={newColor} onChange={setNewColor} />
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1 rounded-lg bg-dusk-400/15 px-3 py-1.5 text-xs text-dusk-300 transition-colors hover:bg-dusk-400/25"
          >
            <Plus className="h-3.5 w-3.5" />
            添加标签
          </button>
        </div>

        {error && <p className="mb-3 text-xs text-red-300">{error}</p>}

        <div className="flex-1 space-y-2 overflow-y-auto">
          {tags.map((tag) =>
            editingId === tag.id ? (
              <div
                key={tag.id}
                className="space-y-2 rounded-xl border border-dusk-400/30 bg-teal-950/40 px-3 py-2.5"
              >
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                  className="w-full rounded-lg bg-teal-850 px-2.5 py-1.5 text-sm text-mist-100 outline-none focus:ring-1 focus:ring-dusk-400"
                />
                <ColorSwatches value={editColor} onChange={setEditColor} />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-xs text-mist-400 hover:text-mist-200"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleRename}
                    className="flex items-center gap-1 text-xs text-dusk-300 hover:text-dusk-200"
                  >
                    <Check className="h-3.5 w-3.5" />
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={tag.id}
                className="flex items-center gap-3 rounded-xl border border-teal-800 bg-teal-950/40 px-3 py-2.5"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="flex-1 text-sm text-mist-100">{tag.name}</span>
                <button
                  type="button"
                  onClick={() => startEdit(tag.id)}
                  aria-label="编辑标签"
                  className="text-mist-500 transition-colors hover:text-dusk-300"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                {confirmId === tag.id ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(tag.id)}
                    className="rounded bg-red-900/40 px-2 py-1 text-[11px] text-red-300 hover:bg-red-900/60"
                  >
                    确认删除
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleDelete(tag.id)}
                    aria-label="删除标签"
                    className="text-mist-500 transition-colors hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )
          )}
          {tags.length === 0 && (
            <p className="py-6 text-center text-xs text-mist-500">还没有标签，先在上方创建一个</p>
          )}
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-mist-500">
          标签重命名后，已挂标签的记录会自动显示新名字；删除标签只会把它从记录上取下，窗景记录本身会保留。
        </p>
      </div>
    </div>
  )
}
