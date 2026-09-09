import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
 // reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://www.demoblaze.com',
    headless: true,
    screenshot: 'on', //'on' | 'off' | 'only-on-failure',
    video: 'on', //'on' | 'off' |'retain-on-failure',
    trace: 'on', //'on' | 'off' |'retain-on-failure', 
    launchOptions: {
      slowMo: 500,
    },

  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  reporter: [
    ['list'],
['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
});