import { test, expect } from '../fixtures';

test.describe('Clase 09 - Fixtures y datos de prueba', () => {

  test('Usando fixture de login: verificar inventario', async ({ inventoryPage, page }) => {
    // El fixture ya hizo el login - verificamos el inventario
    const count = await inventoryPage.getProductCount();
    expect(count).toBe(6);
    console.log(`Inventario tiene ${count} productos (via fixture)`);
  });

  test('Usando fixture de carrito: verificar que hay 1 item', async ({ cartPage }) => {
    const count = await cartPage.getItemCount();
    expect(count).toBe(1);
    console.log(`Carrito tiene ${count} item (via fixture)`);
  });

  test('Usando fixture de loginPage: login manual en el test', async ({ loginPage, page }) => {
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/inventory/);
  });

});


import { test as baseTest } from '@playwright/test';

// Datos de prueba para diferentes usuarios
const usuariosDeLogin = [
  {
    username: 'standard_user',
    password: 'secret_sauce',
    esperadoURL: /inventory/,
    descripcion: 'usuario estándar puede ingresar'
  },
  {
    username: 'locked_out_user',
    password: 'secret_sauce',
    esperadoURL: null,
    descripcion: 'usuario bloqueado no puede ingresar'
  },
  
  {
    username: '',
    password: '',
    esperadoURL: null,
    descripcion: 'campos vacios muestran error'
  },
];

baseTest.describe('Clase 09 - Tests parametrizados de login', () => {

  for (const datos of usuariosDeLogin) {
    baseTest(`Login: ${datos.descripcion}`, async ({ page }) => {
      await page.goto('https://www.saucedemo.com');
      await page.locator('#user-name').fill(datos.username);
      await page.locator('#password').fill(datos.password);
      await page.locator('#login-button').click();
      if (datos.esperadoURL) {
        await expect(page).toHaveURL(datos.esperadoURL);
        console.log(`${datos.descripcion}: acceso correcto`);
      } else {
        // Debe mostrar error
        const error = page.locator('[data-test="error"]');
        await expect(error).toBeVisible();
        console.log(`${datos.descripcion}: error mostrado correctamente`);
      }
    });
  }

});

// Tests parametrizados de productos
const productosAVerificar = [
  'Sauce Labs Backpack',
  'Sauce Labs Bike Light',
  'Sauce Labs Bolt T-Shirt',
];

baseTest.describe('Clase 09 - Agregar productos al carrito (parametrizado)', () => {

  baseTest.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();
    await expect(page).toHaveURL(/inventory/);
  });

  for (const producto of productosAVerificar) {
    baseTest(`Agregar al carrito: ${producto}`, async ({ page }) => {
      // Localizar el contenedor del producto por su nombre
      const itemContainer = page.locator('.inventory_item', {
        
        has: page.locator('.inventory_item_name', { hasText: producto })
      });

      // Hacer clic en el boton 'Add to cart'
      await itemContainer.locator('button').click();

      // Verificar que el boton cambie a 'Remove'
      await expect(itemContainer.locator('button')).toHaveText('Remove');

      // Verificar que el contador del carrito muestre 1
      const badge = page.locator('.shopping_cart_badge');
      await expect(badge).toHaveText('1');

      console.log(`Producto agregado correctamente: ${producto}`);
    });
  }

});