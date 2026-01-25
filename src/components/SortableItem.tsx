'use client'

import { useSortable } from '@dnd-kit/react/sortable'

interface SortableItemProps {
  id: string
  index: number
  name: string
  onDoubleClick: (event: React.MouseEvent<HTMLElement>) => void
  showIndex?: boolean
  containerId: string
}

export default function SortableItem({
  id,
  index,
  name,
  onDoubleClick,
  showIndex = false,
  containerId
}: SortableItemProps) {
  const { ref, isDragging } = useSortable({
    id,
    index,
    type: 'item',
    accept: ['item', 'column'],
    group: containerId
  })

  return (
    <div
      ref={ref}
      style={{ touchAction: 'none' }}
      id={id}
      className={`relative flex cursor-grab items-center rounded-lg bg-white p-2 shadow-sm active:cursor-grabbing ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
      onDoubleClick={onDoubleClick}
    >
      {showIndex && `${index + 1}. `}
      {name}
    </div>
  )
}
