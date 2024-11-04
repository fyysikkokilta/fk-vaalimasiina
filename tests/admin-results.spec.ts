import { test } from '@playwright/test'

import { loginAdmin } from './utils/admin-login'
import { resetDatabase } from './utils/db'

test.beforeEach(async ({ page, request }) => {
  await resetDatabase(request)
  await loginAdmin(page)
})

