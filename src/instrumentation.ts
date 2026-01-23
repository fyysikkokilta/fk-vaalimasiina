export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      await import('./db/migrate')
    } catch (error) {
      console.error('Failed to run migrations during startup:', error)
      throw error
    }
  }
}
