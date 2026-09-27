import { defineConfig, devices } from '@playwright/test';

const PORT = 8124;

// One process serves both halves, so the test server is the real server — not a
// stand-in. `npm test` builds the SPA first, then boots it against a throwaway DB.
export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  fullyParallel: false,        // the tests mutate shared org state, so keep them ordered
  workers: 1,
  reporter: [['list']],

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: {
    command: 'node -e "for (const f of [\'e2e.db\',\'e2e.db-wal\',\'e2e.db-shm\']) { try { require(\'node:fs\').rmSync(f, { force: true }); } catch {} }" && node scripts/load-db.js && npm run build && node -e "process.env.NODE_ENV=\'production\'; import(\'./server/index.js\')"',
    url: `http://localhost:${PORT}/v1/auth/me`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      DATABASE_FILE: 'e2e.db',
      PORT: String(PORT),
      NODE_ENV: 'production',
      JWT_SECRET: 'e2e-secret',
    },
  },
});
