import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['src/**/*.integration.test.ts', 'src/**/*.integration.test.tsx', 'tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/tests/**',
        'src/**/*.d.ts',
        'src/app/**',                        // Next.js route pages tested via Playwright
        'src/lib/admin-supabase.ts',         // DB infrastructure — requires live Supabase
        'src/lib/mock-artists.ts',           // Static data, no logic
        'src/services/artist-token-store.ts',// Covered by integration tests
        'src/services/booking-service.ts',   // Covered by integration tests
        'src/services/calendar-service.ts',  // Covered by integration tests
        'src/services/webhook-handler.ts',   // Covered by integration tests
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
