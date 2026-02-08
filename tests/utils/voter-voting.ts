import { expect, Locator, Page } from '@playwright/test'

export const dragCandidate = async (page: Page, draggable: Locator, droppable: Locator) => {
  await expect(draggable).not.toHaveAttribute('data-dnd-dragging')

  // Get bounding boxes for precise positioning
  const draggableBox = await draggable.boundingBox()
  const droppableBox = await droppable.boundingBox()

  if (!draggableBox || !droppableBox) {
    throw new Error('Could not find draggable or droppable element')
  }

  // Simulate pointer events for @dnd-kit/react which uses PointerSensor
  // Move to draggable element
  await page.mouse.move(
    draggableBox.x + draggableBox.width / 2,
    draggableBox.y + draggableBox.height / 2
  )

  // Press down to start drag
  await page.mouse.down()

  // Move to destination with multiple steps to trigger drag events
  await page.mouse.move(
    droppableBox.x + droppableBox.width / 2,
    droppableBox.y + droppableBox.height / 2,
    { steps: 30 }
  )

  // Release to complete drop
  await page.mouse.up()
}
