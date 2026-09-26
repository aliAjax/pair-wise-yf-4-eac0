import type { SceneTag } from '@/types'

interface TagChipProps {
  tag: SceneTag
  selected?: boolean
  onClick?: () => void
}

export default function TagChip({ tag, selected = false, onClick }: TagChipProps) {
  const style = {
    color: tag.color,
    borderColor: selected ? tag.color : `${tag.color}44`,
    backgroundColor: selected ? `${tag.color}26` : `${tag.color}14`,
  }
  const content = (
    <>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
      {tag.name}
    </>
  )
  const className = 'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] transition-colors'

  if (onClick) {
    return (
      <button type="button" onClick={onClick} style={style} className={`${className} hover:opacity-80`}>
        {content}
      </button>
    )
  }
  return (
    <span style={style} className={className}>
      {content}
    </span>
  )
}
