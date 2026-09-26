import type { SceneTag } from '@/types'

interface TagSelectProps {
  tags: SceneTag[]
  selectedIds: string[]
  onToggle: (id: string) => void
}

export default function TagSelect({ tags, selectedIds, onToggle }: TagSelectProps) {
  if (tags.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const active = selectedIds.includes(tag.id)
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => onToggle(tag.id)}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              active
                ? ''
                : 'border-teal-800 bg-teal-900/40 text-mist-400 hover:border-teal-700 hover:text-mist-200'
            }`}
            style={
              active
                ? {
                    color: tag.color,
                    borderColor: tag.color,
                    backgroundColor: `${tag.color}26`,
                  }
                : undefined
            }
          >
            {tag.name}
          </button>
        )
      })}
    </div>
  )
}
