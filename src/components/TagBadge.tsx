import type { SceneTag } from '@/types'

interface TagBadgeProps {
  tag: SceneTag
  size?: 'sm' | 'md'
}

export default function TagBadge({ tag, size = 'md' }: TagBadgeProps) {
  const sizeClass = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${sizeClass}`}
      style={{
        color: tag.color,
        borderColor: `${tag.color}55`,
        backgroundColor: `${tag.color}14`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
      {tag.name}
    </span>
  )
}
