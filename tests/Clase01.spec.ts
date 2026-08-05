import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test.beforeAll(() => {
  if (!fs.existsSync('./evidencias')) {
    fs.mkdirSync('./evidencias/clase02');
  }
});


test('La página carga', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/STORE/);
  await expect(page.locator('#navbarExample')).toBeVisible();
});


test('El menú de categorías es visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#cat')).toBeVisible();
});

test('La barra de navegación tiene los enlaces', async ({ page }) => {
  await page.goto('/');

  const nav = page.locator('#navbarExample');

  await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Contac' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'About us' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Cart' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Log in' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Sign up' })).toBeVisible();
});