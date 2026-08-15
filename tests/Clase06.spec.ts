import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';


test.describe('Clase 06 - Page Object Model en Sauce Demo', () => {

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

});