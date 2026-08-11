import { test, expect } from '@playwright/test';

test.describe('Clase 05 - Assertions y técnicas de diseño de pruebas en Sauce Demo',() => {

    test('CE válida: login con credenciales correctas', async ({ page }) => {
        await page.goto('https://www.saucedemo.com');

        await page.locator('#user-name').fill('standard_user');
        await page.locator('#password').fill('secret_sauce');
        await page.locator('#login-button').click();

        // Assertion: debemos llegar al inventario
        await expect(page).toHaveURL(/inventory/);

        await expect(
            page.locator('.inventory_container')
        ).toBeVisible();

        console.log('CE válida: login exitoso');
        });

        test('CE inválida: usuario no existe', async ({ page }) => {
            await page.goto('https://www.saucedemo.com');

            await page.locator('#user-name').fill('usuario_inexistente');
            await page.locator('#password').fill('secret_sauce');
            await page.locator('#login-button').click();

            // Assertion: debe aparecer mensaje de error
            const errorMsg = page.locator('[data-test="error"]');

            await expect(errorMsg).toBeVisible();

            await expect(errorMsg)
                .toContainText('Username and password do not match');

            // Assertion: NO debemos haber navegado al inventario
            await expect(page).not.toHaveURL(/inventory/);
        });

        test('CE inválida: usuario bloqueado', async ({ page }) => {
            await page.goto('https://www.saucedemo.com');

            await page.locator('#user-name').fill('locked_out_user');
            await page.locator('#password').fill('secret_sauce');
            await page.locator('#login-button').click();

            const errorMsg = page.locator('[data-test="error"]');

            await expect(errorMsg).toBeVisible();
            await expect(errorMsg).toContainText('locked out');

            console.log('CE usuario bloqueado: mensaje correcto mostrado');
        });

        test('Valor en frontera: campos vacíos (frontera de longitud mínima)',
         async ({ page }) => {
                await page.goto('https://www.saucedemo.com');

                // No llenar nada y hacer clic
                await page.locator('#login-button').click();

                const errorMsg = page.locator('[data-test="error"]');

                await expect(errorMsg).toBeVisible();
                await expect(errorMsg).toContainText('Username is required');

                console.log('Valor frontera: campo vacío maneja error correctamente');
            }
         );

        test('Verificar que el inventario tiene exactamente 6 productos', async ({ page }) => {
            await page.goto('https://www.saucedemo.com');

            await page.locator('#user-name').fill('standard_user');
            await page.locator('#password').fill('secret_sauce');
            await page.locator('#login-button').click();

            await expect(page).toHaveURL(/inventory/);

            // Contar productos con assertion exacta
            const productos = page.locator('.inventory_item');

            await expect(productos).toHaveCount(6);

            //console.log([productos]);

            console.log('El inventario tiene exactamente 6 productos');

        });

        test('Verificar precio del primer producto con regex', async ({ page }) => {
            await page.goto('https://www.saucedemo.com');
            await page.locator('#user-name').fill('standard_user');
            await page.locator('#password').fill('secret_sauce');
            await page.locator('#login-button').click();
            await expect(page).toHaveURL(/inventory/);

            const textoPrecio = await page.locator('.inventory_item_price')
            .first().textContent();

            // El regex valida el formato $XX.XX (p.ej. $29.99)
            expect(textoPrecio?.trim()).toMatch(/^\$\d+\.\d{2}$/);
        });        

         test('Verificar atributos y estados de los elementos del inventario', async ({ page }) => {
            await page.goto('https://www.saucedemo.com');

            await page.locator('#user-name').fill('standard_user');
            await page.locator('#password').fill('secret_sauce');
            await page.locator('#login-button').click();

            await expect(page).toHaveURL(/inventory/);

            const primerBoton = page.locator('.btn_inventory').first();

            await expect(primerBoton).toBeEnabled();
            await expect(primerBoton).toHaveText('Add to cart');

            // Clic y verificar que cambió a 'Remove'
            await primerBoton.click();

            await expect(primerBoton).toHaveText('Remove');

            // Verificar que el carrito muestra 1 item
            const badgeCarrito = page.locator('.shopping_cart_badge');

            await expect(badgeCarrito).toBeVisible();
            await expect(badgeCarrito).toHaveText('1');

            console.log('El botón cambia de estado y el carrito se actualiza');
        });


        test('Verificar múltiples propiedades del primer producto con soft assertions', async ({ page }) => {
            await page.goto('https://www.saucedemo.com');
            await page.locator('#user-name').fill('standard_user');
            await page.locator('#password').fill('secret_sauce');
            await page.locator('#login-button').click();

            const primerProducto = page.locator('.inventory_item').first();

            await expect.soft(primerProducto.locator('.inventory_item_name')).toBeVisible();
            await expect.soft(primerProducto.locator('.inventory_item_desc')).toBeVisible();
            await expect.soft(primerProducto.locator('.inventory_item_price')).toBeVisible();
            await expect.soft(primerProducto.locator('.btn_inventory')).toBeEnabled();
            await expect.soft(primerProducto.locator('img')).toBeVisible();

            console.log('Soft assertions del primer producto completadas');
         });

        test('Tabla de decisión Regla 1: logueado con items -> puede pagar', async ({ page }) => {
            await page.goto('https://www.saucedemo.com');
            await page.locator('#user-name').fill('standard_user');
            await page.locator('#password').fill('secret_sauce');
            await page.locator('#login-button').click();

            await page.locator('.btn_inventory').first().click();
            await page.locator('.shopping_cart_link').click();
            await expect(page).toHaveURL(/cart/);

            const btnCheckout = page.getByText('Checkout');
            await expect(btnCheckout).toBeVisible();
            await expect(btnCheckout).toBeEnabled();
        });

        test('Tabla de decisión - Regla 2: logueado sin items -> carrito vacío', async ({ page }) => {
            await page.goto('https://www.saucedemo.com');
            await page.locator('#user-name').fill('standard_user');
            await page.locator('#password').fill('secret_sauce');
            await page.locator('#login-button').click();

            await page.locator('.shopping_cart_link').click();

            const itemsCarrito = page.locator('.cart_item');
            await expect(itemsCarrito).toHaveCount(0);
        });

        // ==========================================
        // TESTS RETO (TAREA 05)
        // ==========================================

        test('Reto 1: toHaveValue() - Ordenar catálogo y verificar selección', async ({ page }) => {
        await page.goto('https://www.saucedemo.com');
        await page.locator('#user-name').fill('standard_user');
        await page.locator('#password').fill('secret_sauce');
        await page.locator('#login-button').click();
        await expect(page).toHaveURL(/inventory/);

        const selectorOrden = page.locator('[data-test="product-sort-container"]');
        // Seleccionar orden por precio de menor a mayor ('lohi')
        await selectorOrden.selectOption('lohi');

        // Verificar usando toHaveValue que el valor seleccionado en el select es 'lohi'
        await expect(selectorOrden).toHaveValue('lohi');

        // Verificar el nuevo primer precio después de ordenar (el más barato)
        const primerPrecio = page.locator('.inventory_item_price').first();
        await expect(primerPrecio).toHaveText('$7.99');
        });

        test('Reto 2: toBeFocused() - Verificar foco en campo de usuario', async ({ page }) => {
        await page.goto('https://www.saucedemo.com');

        const inputUsuario = page.locator('#user-name');
        // Hacer clic en el campo de usuario
        await inputUsuario.click();

        // Verificar que recibió el foco del teclado usando toBeFocused()
        await expect(inputUsuario).toBeFocused();
        });

        test('Reto 3: toHaveCSS() - Verificar propiedad de estilo computada', async ({ page }) => {
        await page.goto('https://www.saucedemo.com');
        await page.locator('#user-name').fill('standard_user');
        await page.locator('#password').fill('secret_sauce');
        await page.locator('#login-button').click();
        await expect(page).toHaveURL(/inventory/);

        const primerBoton = page.locator('.btn_inventory').first();

        // Verificar una propiedad de estilo computada, por ejemplo que el cursor sea 'pointer'
        await expect(primerBoton).toHaveCSS('cursor', 'pointer');
         });

    }
);