import { Page } from '@playwright/test'

export const selectCandidate = async (page: Page, candidateName: string) => {
  // Find the draggable element by text within the available candidates container
  const draggable = page
    .locator('#availableCandidates')
    .getByText(candidateName)
  const destination = page.locator('#selectedCandidates')

  // Get bounding boxes for precise positioning
  const draggableBox = await draggable.boundingBox()
  const destinationBox = await destination.boundingBox()

  if (!draggableBox || !destinationBox) {
    throw new Error('Could not find draggable or destination element')
  }

  // Simulate pointer events for @dnd-kit/react which uses PointerSensor
  // Move to draggable element
  await page.mouse.move(
    draggableBox.x + draggableBox.width / 2,
    draggableBox.y + draggableBox.height / 2
  )

  // Press down to start drag
  await page.mouse.down()

  // Small delay to ensure drag start is registered
  await page.waitForTimeout(50)

  // Move to destination with multiple steps to trigger drag events
  await page.mouse.move(
    destinationBox.x + destinationBox.width / 2,
    destinationBox.y + destinationBox.height / 2,
    { steps: 30 }
  )

  // Release to complete drop
  await page.mouse.up()

  // Wait for the drag operation to complete and state to update
  await page.waitForTimeout(300)
}

export const doubleClickToAdd = async (page: Page, candidateName: string) => {
  // Find the candidate element by text within the available candidates container
  const candidate = page
    .locator('#availableCandidates')
    .getByText(candidateName)

  // Double-click to add to selected
  await candidate.dblclick()

  // Wait for the state to update
  await page.waitForTimeout(100)
}

export const doubleClickToRemove = async (
  page: Page,
  candidateName: string
) => {
  // Find the candidate element by text within the selected candidates container
  // Use contains to match the candidate name even with the index prefix (e.g., "1. Candidate 1")
  const candidate = page.locator('#selectedCandidates').getByText(candidateName)

  // Double-click to remove from selected
  await candidate.dblclick()

  // Wait for the state to update
  await page.waitForTimeout(100)
}

export const deselectCandidate = async (page: Page, candidateName: string) => {
  // Find the draggable element by text within the selected candidates container
  // Use contains to match the candidate name even with the index prefix (e.g., "1. Candidate 1")
  const draggable = page.locator('#selectedCandidates').getByText(candidateName)
  const destination = page.locator('#availableCandidates')

  // Get bounding boxes for precise positioning
  const draggableBox = await draggable.boundingBox()
  const destinationBox = await destination.boundingBox()

  if (!draggableBox || !destinationBox) {
    throw new Error('Could not find draggable or destination element')
  }

  // Simulate pointer events for @dnd-kit/react which uses PointerSensor
  // Move to draggable element
  await page.mouse.move(
    draggableBox.x + draggableBox.width / 2,
    draggableBox.y + draggableBox.height / 2
  )

  // Press down to start drag
  await page.mouse.down()

  // Small delay to ensure drag start is registered
  await page.waitForTimeout(50)

  // Move to destination with multiple steps to trigger drag events
  await page.mouse.move(
    destinationBox.x + destinationBox.width / 2,
    destinationBox.y + destinationBox.height / 2,
    { steps: 30 }
  )

  // Release to complete drop
  await page.mouse.up()

  // Wait for the drag operation to complete and state to update
  await page.waitForTimeout(300)
}
