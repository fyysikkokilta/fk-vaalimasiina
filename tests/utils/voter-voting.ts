import { Page } from '@playwright/test'

export const selectCandidate = async (page: Page, candidateName: string) => {
  const draggable = page.getByRole('button', { name: candidateName })
  const destination = page.locator('#selected-candidates')

  const dragBoundingBox = await draggable.boundingBox()
  const dropBoundingBox = await destination.boundingBox()

  await page.mouse.move(
    dragBoundingBox!.x + dragBoundingBox!.width / 2,
    dragBoundingBox!.y + dragBoundingBox!.height / 2
  )
  await page.mouse.down()
  await page.mouse.move(
    dropBoundingBox!.x + dropBoundingBox!.width / 2,
    dropBoundingBox!.y + dropBoundingBox!.height / 2,
    {
      steps: 10
    }
  )
  await page.mouse.up()
}

export const deselectCandidate = async (page: Page, candidateName: string) => {
  const draggable = page.getByRole('button', { name: candidateName })
  const destination = page.locator('#available-candidates')

  const dragBoundingBox = await draggable.boundingBox()
  const dropBoundingBox = await destination.boundingBox()

  await page.mouse.move(
    dragBoundingBox!.x + dragBoundingBox!.width / 2,
    dragBoundingBox!.y + dragBoundingBox!.height / 2
  )
  await page.mouse.down()
  await page.mouse.move(
    dropBoundingBox!.x + dropBoundingBox!.width / 2,
    dropBoundingBox!.y + dropBoundingBox!.height / 2,
    {
      steps: 10
    }
  )
  await page.mouse.up()
}
