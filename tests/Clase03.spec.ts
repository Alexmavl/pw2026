import { test, expect } from '@playwright/test';
import * as fs from 'fs';

// Crear carpeta para evidencias si no existe
test.beforeAll(() => {
  if (!fs.existsSync('./evidencias')) {
    fs.mkdirSync('./evidencias');
  }
});

test.describe('Clase 03 - Locators en DemoBlaze', () => {

        test('Locator por texto: verificar elementos del menú', async ({ page }) => {
        await page.goto('/');

        // getByText encuentra cualquier elemento que contenga el texto.
        // Por eso limitamos la búsqueda al navbar.
        const nav = page.locator('#navbarExample');

        await expect(nav.getByText('Home')).toBeVisible();
        await expect(nav.getByText('Contact')).toBeVisible();
        await expect(nav.getByText('About us')).toBeVisible();

        // Para buscar un texto exacto usamos { exact: true }
        await expect(
        nav.getByText('Cart', { exact: true })
        ).toBeVisible();
    });
 
    test('Locator por CSS: productos en la página principal', async ({ page }) => {
        await page.goto('/');

        await page.waitForSelector('.card-title');

        const tarjetas = page.locator('.card');
        const cantidad = await tarjetas.count();

        expect(cantidad).toBeGreaterThan(0);

        const primerProducto = page.locator('.card-title a').first();
        const nombreProducto = await primerProducto.textContent();

        expect(nombreProducto).not.toBeNull();
    });

    test('Locator por ID: campos del modal de login', async ({ page }) => {
        await page.goto('/');

        // "Log in" también aparece en el título y botón del modal.
        // Limitamos la búsqueda al navbar y seleccionamos el enlace.
        await page
            .locator('#navbarExample')
            .getByRole('link', { name: 'Log in', exact: true })
            .click();

        await page.waitForSelector('#logInModal', {
            state: 'visible'
        });

        await expect(page.locator('#loginusername')).toBeVisible();
        await expect(page.locator('#loginpassword')).toBeVisible();
     });


      test('Locator por atributo: imagen del primer producto', async ({ page }) => {
        await page.goto('/');

        await page.waitForSelector('.card-title');

        // Abrir el primer producto
        await page.locator('.card-title a').first().click();
        await page.waitForLoadState('domcontentloaded');

        // Localizar la imagen del producto
        const imagenProducto = page.locator('.product-image img');

        await expect(imagenProducto).toBeVisible();

        // Obtener y verificar el atributo src
        const srcImagen = await imagenProducto.getAttribute('src');

        expect(srcImagen).not.toBeNull();
    });

    test('Locators encadenados: precio dentro de una tarjeta', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card-title');

    // .locator() sobre otro locator = buscar SOLO dentro de él
    const primeraTarjeta = page.locator('.card').first();
    const precio = primeraTarjeta.locator('h5');
    await expect(precio).toBeVisible();
    });

    test('Verificar que NO existe un elemento (negación)', async ({ page }) => {
    await page.goto('/');
    const mensajeVacio = page.getByText('No products found');
    await expect(mensajeVacio).not.toBeVisible();
    });
 

    // ==========================================
    // TESTS RETO DE LA TAREA 03
    // ==========================================

    test('Reto 1: Locator por rol - Botón Place Order en el carrito', async ({ page }) => {
        await page.goto('/cart.html');
        const botonPlaceOrder = page.getByRole('button', { name: 'Place Order' });
        await expect(botonPlaceOrder).toBeVisible();
    });

    test('Reto 2: Locator con filter - Producto específico y su precio', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.card-title');

        // Buscar la tarjeta que contenga el texto del producto específico
        const tarjetaSamsung = page.locator('.card').filter({ hasText: 'Samsung galaxy s6' });
        await expect(tarjetaSamsung).toBeVisible();

        const precioSamsung = tarjetaSamsung.locator('h5');
        await expect(precioSamsung).toBeVisible();
    });

   test('Reto 3: Locator por atributo parcial - Categorías del sidebar', async ({ page }) => {
        await page.goto('/');

        // Las categorías del sidebar en DemoBlaze comparten el selector con ID o atributo que contiene "itemc"
        const categorias = page.locator('[id*="itemc"]');
        
        // Esperar a que al menos la primera categoría esté visible
        await expect(categorias.first()).toBeVisible();
        
        // Verificamos que existan al menos las 3 categorías principales (Phones, Laptops, Monitors)
        const cantidadCategorias = await categorias.count();
        expect(cantidadCategorias).toBeGreaterThanOrEqual(3);
    });
});