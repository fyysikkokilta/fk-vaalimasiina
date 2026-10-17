import { defineConfig, devices } from '@playwright/test'

// Tests deliberately do not read .env: the tests clear every table, so they
// must never point at a dev database by accident. These defaults are the whole
// env contract for local and CI runs; anything already set in the shell wins.
const testEnv = {
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:55432/vaalimasiina_test',
  AUTH_SECRET: 'test-auth-secret',
  ADMIN_EMAILS: 'test@email.com',
  NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
  // Empty values keep `next dev` from filling these in from .env, so a run never
  // talks to real S3 storage or OAuth providers
  OAUTH_PROVIDERS: '',
  S3_ACCESS_KEY_ID: '',
  S3_SECRET_ACCESS_KEY: '',
  S3_ENDPOINT: ''
}
for (const [key, value] of Object.entries(testEnv)) {
  process.env[key] ??= value
}

// Set by `pnpm test:algorithm` for tests that need neither the app nor the database
const algorithmOnly = !!process.env.PW_ALGORITHM_ONLY

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000/en/',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry'
  },

  /* Configure projects for major browsers */
  projects: process.env.CI
    ? [
        // In CI, only run Chromium for faster test execution
        {
          name: 'chromium',
          use: {
            ...devices['Desktop Chrome'],
            contextOptions: {
              permissions: ['clipboard-read', 'clipboard-write']
            }
          }
        }
      ]
    : [
        // Local development: run all browsers
        {
          name: 'chromium',
          use: {
            ...devices['Desktop Chrome'],
            contextOptions: {
              permissions: ['clipboard-read', 'clipboard-write']
            }
          }
        },

        {
          name: 'firefox',
          use: {
            ...devices['Desktop Firefox'],
            contextOptions: {
              permissions: ['clipboard-read']
            }
          }
        },

        {
          name: 'webkit',
          use: {
            ...devices['Desktop Safari'],
            contextOptions: {
              permissions: ['clipboard-read']
            }
          }
        }

        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },

        /* Test against branded browsers. */
        // {
        //   name: 'Microsoft Edge',
        //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
        // },
        // {
        //   name: 'Google Chrome',
        //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        // },
      ],

  globalSetup: algorithmOnly ? undefined : './tests/global-setup.ts',

  /* Start a dev server with the test env. A server you already run would use your
     own .env and database, so an occupied port fails the run instead of reusing it. */
  webServer: algorithmOnly
    ? undefined
    : {
        command: 'pnpm dev',
        url: 'http://localhost:3000/',
        reuseExistingServer: false
      }
})
