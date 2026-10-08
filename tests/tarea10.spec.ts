import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Tarea Clase 10 - Tests Reto', () => {
  
  // Reto 1: Tags múltiples + --grep-invert
  test('Verificar carrito de compras', { tag: ['@regression', '@ui'] }, async ({ page }) => {
    await loginAs(page, 'standard_user');
    await page.locator('.shopping_cart_link').click();
    await expect(page).toHaveURL(/cart/);
    await expect(page.locator('.title')).toHaveText('Your Cart');
  });

  // Reto 2: expect.soft()
  test('Validar múltiplos atributos del primer producto sin detener el test', async ({ page }) => {
    await loginAs(page, 'standard_user');

    const primerProducto = page.locator('.inventory_item').first();
    const nombre = primerProducto.locator('.inventory_item_name');
    const precio = primerProducto.locator('.inventory_item_price');
    const boton = primerProducto.locator('.btn_inventory');

    // Asertiones suaves: si una falla, el test continúa ejecutando las demás
    await expect.soft(nombre).toBeVisible();
    await expect.soft(nombre).toHaveText('Sauce Labs Backpack');
    await expect.soft(precio).toContainText('$');
    await expect.soft(boton).toHaveText('Add to cart');
  });

  // Reto 3: Fixture browserName
  test('Aserción condicionada según el motor del navegador', async ({ page, browserName }) => {
    await loginAs(page, 'standard_user');
    
    // Cambiamos el comportamiento o la aserción en función del motor (chromium, firefox, webkit)
    if (browserName === 'chromium') {
      await expect(page.locator('.app_logo')).toHaveText('Swag Labs');
    } else if (browserName === 'firefox') {
      await expect(page.locator('.app_logo')).toBeVisible();
    } else if (browserName === 'webkit') {
      await expect(page.locator('.app_logo')).toContainText('Swag');
    }
  });

});