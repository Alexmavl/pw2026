import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { MenuPage } from '../pages/MenuPage';


test.describe('Clase 06 - Page Object Model en Sauce Demo', () => {

    // Hook para tomar captura después de cada test
    test.afterEach(async ({ page }, testInfo) => {
        // Limpia el nombre del test para que sea un nombre de archivo válido
        const nombreArchivo = testInfo.title.replace(/[^a-zA-Z0-9]/g, '_');
        await page.screenshot({ path: `evidencias/clase06/${nombreArchivo}.png` });
    });


    
    test('Login exitoso con POM', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.login('standard_user', 'secret_sauce');
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.expectToBeOnInventoryPage();
        console.log('Login con POM exitoso');
        });

        test('Login fallido con POM', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.login('wrong_user', 'wrong_pass');
        await loginPage.expectLoginError(
        'Username and password do not match');
        console.log('Error de login capturado con POM');
    });

    test('Flujo completo: login -> agregar 2 productos-> verificar carrito', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const inventoryPage = new InventoryPage(page);
        const cartPage = new CartPage(page);
        // Login
        await loginPage.navigate();
        await loginPage.login('standard_user', 'secret_sauce');
        await inventoryPage.expectToBeOnInventoryPage();
        // Agregar productos por nombre
        await inventoryPage.addProductByName('Sauce Labs Backpack');
        await inventoryPage.addProductByName('Sauce Labs Bike Light');

        // Verificar badge del carrito
        await expect(inventoryPage.cartBadge).toHaveText('2');
        // Ir al carrito
        await inventoryPage.goToCart();
        await cartPage.expectItemCount(2);
        console.log('Flujo completo con POM: 2 productos en carrito');
    });

   test('Verificar que el inventario tiene 6 productos', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const inventoryPage = new InventoryPage(page);
        await loginPage.navigate();
        await loginPage.login('standard_user', 'secret_sauce');
        const count = await inventoryPage.getProductCount();
        expect(count).toBe(6);
    });

    test('Ordenar productos de mayor a menor precio', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const inventoryPage = new InventoryPage(page);
        await loginPage.navigate();
        await loginPage.login('standard_user', 'secret_sauce');
        // Ordenar de mayor a menor precio
        await inventoryPage.sortBy('hilo');
        // continúa en la siguiente diapositiva..

        const precios = page.locator('.inventory_item_price');
        const primerPrecio = await precios.first().textContent();
        // Los precios deben estar en orden descendente
        const todosLosPrecios = await precios.allTextContents();
        const numericos = todosLosPrecios.map(
        p => parseFloat(p.replace('$', '')));
        for (let i = 0; i < numericos.length - 1; i++) {
            expect(numericos[i]).toBeGreaterThanOrEqual(numericos[i + 1]);
        }
        });

        test('Reto 1 - Flujo completo de compra (Checkout)', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const inventoryPage = new InventoryPage(page);
        const cartPage = new CartPage(page);
        const checkoutPage = new CheckoutPage(page);

        await loginPage.navigate();
        await loginPage.login('standard_user', 'secret_sauce');
        await inventoryPage.addProductByName('Sauce Labs Backpack');
        await inventoryPage.goToCart();
        await cartPage.proceedToCheckout();
        
        await checkoutPage.fillInformation('Marvin', 'Vásquez', '01001');
        await checkoutPage.finishCheckout();
        console.log('Reto 1 completado: Compra finalizada con éxito');
    });

    test('Reto 2 - Flujo de logout', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const menuPage = new MenuPage(page);

        await loginPage.navigate();
        await loginPage.login('standard_user', 'secret_sauce');
        await menuPage.logout();
        
        await expect(loginPage.loginButton).toBeVisible();
        console.log('Reto 2 completado: Logout exitoso');
    });

    test('Reto 3 - Remover producto y verificar badge', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const inventoryPage = new InventoryPage(page);

        await loginPage.navigate();
        await loginPage.login('standard_user', 'secret_sauce');
        
        await inventoryPage.addProductByName('Sauce Labs Fleece Jacket');
        await expect(inventoryPage.cartBadge).toBeVisible();
        
        await inventoryPage.removeProductByName('Sauce Labs Fleece Jacket');
        await expect(inventoryPage.cartBadge).toBeHidden();
        console.log('Reto 3 completado: Badge desaparece al vaciar carrito');
    });

        

});