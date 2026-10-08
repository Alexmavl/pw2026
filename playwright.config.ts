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
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
  ],
  workers: 1, // Evita timeouts al abrir múltiples ventanas simultáneas
  reporter: [
    ['list'],
['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
});