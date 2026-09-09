// tests/tarea07.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

test.describe('Tarea 07 - Tests Reto: Evidencias Avanzadas', () => {

    // Reto 1: test.step() con capturas por paso
    test('Reto 1 - Flujo estructurado con pasos nombrados', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const inventoryPage = new InventoryPage(page);

        await test.step('Paso 1: Navegar a la página principal', async () => {
            await loginPage.navigate();
            await page.screenshot({
                path: './evidencias/tarea07/reto01-paso1-navegacion.png',
                fullPage: true
            });
        });

        await test.step('Paso 2: Iniciar sesión con credenciales válidas', async () => {
            await loginPage.login('standard_user', 'secret_sauce');
            await page.screenshot({
                path: './evidencias/tarea07/reto01-paso2-credenciales.png'
            });
        });

        await test.step('Paso 3: Verificar navegación exitosa al inventario', async () => {
            await inventoryPage.expectToBeOnInventoryPage();
            await page.screenshot({
                path: './evidencias/tarea07/reto01-paso3-inventario.png',
                fullPage: true
            });
        });
    });

    // Reto 2: testInfo.attach() + captura de inventario
    test('Reto 2 - Adjuntar datos capturados al reporte HTML', async ({ page }, testInfo) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.login('standard_user', 'secret_sauce');
        await expect(page).toHaveURL(/inventory/);

        const totalProductos = await page.locator('.inventory_item').count();
        const urlActual = page.url();
        const fechaCaptura = new Date().toISOString();

        // Captura en disco
        await page.screenshot({
            path: './evidencias/tarea07/reto02-inventario-productos.png',
            fullPage: true
        });

        const dataReporte = [
            `Fecha de ejecución: ${fechaCaptura}`,
            `URL actual: ${urlActual}`,
            `Cantidad de productos encontrados: ${totalProductos}`
        ].join('\n');

        // Adjunto al reporte HTML
        await testInfo.attach('resumen-ejecucion.txt', {
            body: dataReporte,
            contentType: 'text/plain'
        });
    });

    // Reto 3: toHaveScreenshot() + captura de respaldo en evidencias
    test('Reto 3 - Comparación visual contra baseline', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigate();

        // Captura guardada en la carpeta de evidencias
        await page.screenshot({
            path: './evidencias/tarea07/reto03-login-captura.png',
            fullPage: true
        });

        // Comparación visual contra baseline de Playwright
        await expect(page).toHaveScreenshot('login-page-baseline.png', {
            fullPage: true
        });
    });

});