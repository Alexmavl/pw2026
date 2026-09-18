import { test, expect, Page } from '@playwright/test';
import { loginAs } from '../helpers/auth';

// ============================================================================
// RETO 1: Suite serial con página compartida vía beforeAll / afterAll
// ============================================================================
test.describe('Reto 1 - Flujo E2E serial con página compartida', () => {
  // Configuración en modo serial: si falla un paso, los siguientes se omiten
  test.describe.configure({ mode: 'serial' });

  let page: Page;

  test.beforeAll(async ({ browser }) => {
    // Se inicializa una única instancia de Page para ser reutilizada en la suite
    page = await browser.newPage();
    await loginAs(page, 'standard_user');
  });

  test.afterAll(async () => {
    // Cierre ordenado de la página tras finalizar todos los tests
    await page.close();
  });

  test('Paso 1: Agregar producto al carrito', async () => {
    await expect(page).toHaveURL(/inventory/);
    await page.locator('.btn_inventory').first().click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  test('Paso 2: Validar persistencia del producto en la vista del carrito', async () => {
    // Reutiliza el estado de la página sin volver a autenticarse
    await page.locator('.shopping_cart_link').click();
    await expect(page).toHaveURL(/cart/);
    await expect(page.locator('.cart_item')).toHaveCount(1);
  });
});

// ============================================================================
// RETO 2: test.slow() para extender timeout en operaciones con latencia
// ============================================================================
test.describe('Reto 2 - Manejo de latencia con test.slow()', () => {
  test('Usuario con rendimiento degradado inicia sesión', async ({ page }) => {
    // Triplica el timeout por defecto configurado para evitar falsos negativos por el delay de 5s
    test.slow();

    const tiempoInicio = Date.now();
    await loginAs(page, 'performance_glitch_user');
    const duracionLogin = Date.now() - tiempoInicio;

    console.log(`Login degradado completado en: ${duracionLogin}ms`);
    await expect(page).toHaveURL(/inventory/);
    await expect(page.locator('.inventory_list')).toBeVisible();
  });
});

// ============================================================================
// RETO 3: test.skip() dinámico evaluado en tiempo de ejecución
// ============================================================================
test.describe('Reto 3 - Omitir test condicionalmente en tiempo de ejecución', () => {
  test('Omitir prueba si el usuario bloqueado no puede acceder al inventario', async ({ page }) => {
    await loginAs(page, 'locked_out_user');

    const errorVisible = await page.locator('[data-test="error"]').isVisible();

    // Evaluación dinámica en ejecución: si está bloqueado, se omite el resto del test
    test.skip(
      errorVisible,
      'Usuario locked_out_user bloqueado intencionalmente; se omite verificación de catálogo'
    );

    // Esta sección solo correría si el acceso no estuviese denegado
    await expect(page).toHaveURL(/inventory/);
  });
});