import { test } from '@playwright/test'

import { loginAdmin } from './utils/admin-login'
import { resetDatabase } from './utils/db'

test.beforeEach(async ({ page }) => {
  await resetDatabase()
  await loginAdmin(page)
})

