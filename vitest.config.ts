import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // The suite arrives with `lookupConversation` in the next ticket. Until then the
    // runner is configured but has nothing to run, and that is not a failure.
    passWithNoTests: true,
  },
})
