const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './ete',
  timeout: 60 * 1000,
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'evidence/level3-frontend/playwright-report' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm start',
      cwd: './server',
      url: 'http://localhost:4004/api/health',
      reuseExistingServer: true,
      timeout: 120 * 1000,
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5173',
      cwd: './frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: false,
      timeout: 120 * 1000,
      env: {
        VITE_USE_MOCK: 'false',
        VITE_API_BASE_URL: 'http://localhost:4004',
      },
    },
  ],
});
