import { test, expect } from '@playwright/test';
import * as fs from 'fs';

// Crear carpeta para evidencias si no existe
test.beforeAll(() => {
  if (!fs.existsSync('./evidencias')) {
    fs.mkdirSync('./evidencias');
  }
});

test.describe('Clase 02 - Navegación y esperas en DemoBlaze', () => {

    test('Navegar al carrito y regresar al inicio', async ({ page }) => {
        await page.goto('/');

        await expect(page).toHaveURL(/demoblaze/);

        await page.screenshot({
        path: './evidencias/01-pagina-inicio.png',
        fullPage: true
        });

        await page.getByText('Cart', { exact: true }).click();

        await page.waitForURL('**/cart.html');

        await expect(page).toHaveURL(/cart/);

        await page.screenshot({
        path: './evidencias/02-carrito-vacio.png',
        fullPage: true
        });

        await page.goBack();

        await expect(page).toHaveURL(/demoblaze\.com\/?$/);
    });


  test('Navegar a la categoría Phones y ver un producto', async ({ page }) => {
        await page.goto('/');

        await page.getByText('Phones', { exact: true }).click();

        // Esperar a que aparezcan los productos
        await page.waitForSelector('.card-title a');

        const productos = page.locator('.card-title a');

        expect(await productos.count()).toBeGreaterThan(0);

        await productos.first().click();

        await page.waitForLoadState('domcontentloaded');

        await page.screenshot({
            path: './evidencias/03-detalle-producto.png',
            fullPage: true
        });

        await expect(
            page.getByText('Add to cart', { exact: true })
        ).toBeVisible();
    });


    test('Capturar el navbar y el footer por separado', async ({ page }) => {
        await page.goto('/');

        const navbar = page.locator('#navbarExample');

        await navbar.screenshot({
            path: './evidencias/04-navbar.png'
        });

        
        // 2. Captura del Footer usando su ID real (#footc)
        // Cambiamos el selector genérico por el id específico de DemoBlaze
                //<div id="footc"> de esta manera podemos capturar el footer correctamente, ya que DemoBlaze no utiliza la etiqueta <footer> estándar.
                //<div id="fotcont" class="row">
        const footer = page.locator('#footc');
        
        // Esperamos explícitamente a que esté acoplado al DOM antes de mover la pantalla
        await footer.waitFor({ state: 'attached', timeout: 5000 });
        
        // Forzar el scroll hasta el footer
        await footer.scrollIntoViewIfNeeded();

        // Tomar la captura
        await footer.screenshot({
            path: './evidencias/05-footer.png'
        });
            // DemoBlaze no usa <footer>; el pie de página está
            // dentro de un div con la clase .container-fluid.
            //const footer = page.locator('.container-fluid').last();
            //if (await footer.isVisible()) {
            //  await footer.screenshot({
            //path: './evidencias/05-footer.png'
            //});
            //}
    });

    
    test('Verificar tiempo de carga de la página', async ({ page }) => {
        const startTime = Date.now();

        await page.goto('/');
        await page.waitForLoadState('load');

        const loadTime = Date.now() - startTime;

        console.log(`Tiempo de carga: ${loadTime}ms`);

        // La página debería cargar en menos de 10 segundos
        expect(loadTime).toBeLessThan(10000);
    });        

});