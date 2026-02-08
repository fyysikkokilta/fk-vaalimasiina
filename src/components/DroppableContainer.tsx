'use client'

import { useDroppable } from '@dnd-kit/react'

interface DroppableContainerProps {
  id: string
  children: React.ReactNode
  className?: string
}

export default function DroppableContainer({ id, children, className }: DroppableContainerProps) {
  const { ref } = useDroppable({
    id,
    type: 'column',
    accept: 'item'
  })

  return (
    <div id={id} ref={ref} className={className}>
      {children}
    </div>
  )
}
