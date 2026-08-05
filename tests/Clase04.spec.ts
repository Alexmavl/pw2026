import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

// Crear carpeta para evidencias de la Clase 04 si no existe
test.beforeAll(() => {
    if (!fs.existsSync('./evidencias/clase04')) {
        fs.mkdirSync('./evidencias/clase04', { recursive: true });
    }
});

const usuario = {
    username: `testuser_${Date.now().toString().slice(-6)}`,
    password: 'Password123'
};

async function loginConReintento(page: Page, username: string, password: string, intentos = 5) {
    for (let i = 0; i < intentos; i++) {
        await page.locator('#navbarExample').getByRole('link', { name: 'Log in', exact: true }).click();
        await page.waitForSelector('#logInModal', { state: 'visible' });
        await page.locator('#loginusername').fill(username);
        await page.locator('#loginpassword').fill(password);
        await page.locator('#logInModal').getByRole('button', { name: 'Log in' }).click();

        try {
            await page.waitForSelector('#nameofuser', { state: 'visible', timeout: 4000 });
            return;
        } catch {
            console.log(`Login intento ${i + 1}/${intentos} sin éxito todavía, reintentando...`);
            await page.waitForTimeout(1500);
        }
    }
    throw new Error(`No se pudo iniciar sesión con ${username} tras ${intentos} intentos`);
}

test.describe('Clase 04 - Flujo completo de usuario en DemoBlaze', () => {
    test('Registrar un nuevo usuario', async ({ page }) => {
        await page.goto('/');

        await page.locator('#navbarExample').getByRole('link', { name: 'Sign up', exact: true }).click();
        await page.waitForSelector('#signInModal', { state: 'visible' });

        await page.locator('#sign-username').fill(usuario.username);
        await page.locator('#sign-password').fill(usuario.password);
        await page.locator('#signInModal').screenshot({ path: './evidencias/clase04/registro-llenado.png' });

        // El handler de dialog se registra ANTES del clic que lo dispara
        const dialogPromise = new Promise<void>((resolve) => {
            page.once('dialog', async (dialog) => {
                console.log(`Alert dice: ${dialog.message()}`);
                await dialog.accept();
                resolve();
            });
        });

        await page.locator('#signInModal').getByRole('button', { name: 'Sign up' }).click();
        await dialogPromise;

        console.log(`Usuario ${usuario.username} registrado`);
    });

    test('Login con el usuario registrado', async ({ page }) => {
        page.on('dialog', async (dialog) => {
            console.log(`Dialog: ${dialog.message()}`);
            await dialog.accept();
        });

        await page.goto('/');
        await loginConReintento(page, usuario.username, usuario.password);

        const nombreUsuario = await page.locator('#nameofuser').textContent();
        expect(nombreUsuario).toContain(usuario.username);

        // Captura de pantalla del login exitoso con la sesión iniciada
        await page.screenshot({ 
            path: './evidencias/clase04/02-login-exitoso.png', 
            fullPage: true 
        });

        console.log(`Login exitoso como: ${nombreUsuario}`);
    });

    test('Flujo completo: login -> agregar producto -> verificar carrito', async ({ page }) => {
        page.on('dialog', async (dialog) => {
            await dialog.accept();
        });

        await page.goto('/');
        await loginConReintento(page, usuario.username, usuario.password);

        await page.waitForSelector('.card-title a');
        const primerProducto = page.locator('.card-title a').first();
        const nombreProducto = await primerProducto.textContent();
        await primerProducto.click();

        await page.waitForLoadState('domcontentloaded');

        // Igual que con el registro de usuario: agregar al carrito es una
        // escritura en el backend que tarda un momento en propagarse antes
        // de que aparezca reflejada en /cart.html.
        await page.getByText('Add to cart').click();
        await page.waitForTimeout(2000);

        await page.locator('#navbarExample').getByRole('link', { name: 'Cart', exact: true }).click();
        await page.waitForURL('**/cart.html');
        await page.waitForTimeout(1500);

        const itemsCarrito = page.locator('#tbodyid tr');
        const cantidadItems = await itemsCarrito.count();
        expect(cantidadItems).toBeGreaterThanOrEqual(1);

        console.log(`Flujo completo exitoso. Producto "${nombreProducto}" en carrito.`);
        console.log(`Items en carrito: ${cantidadItems}`);

        // Captura del carrito con el producto agregado
        await page.screenshot({ 
            path: './evidencias/clase04/03-carrito-con-producto.png', 
            fullPage: true 
        });
    });

    test('Intentar login con credenciales incorrectas', async ({ page }) => {
        await page.goto('/');
        await page.locator('#navbarExample').getByRole('link', { name: 'Log in', exact: true }).click();
        await page.waitForSelector('#logInModal', { state: 'visible' });

        await page.locator('#loginusername').fill('usuario_que_no_existe');
        await page.locator('#loginpassword').fill('password_incorrecta');

        // Captura de los datos incorrectos antes de dar clic
        await page.locator('#logInModal').screenshot({ 
            path: './evidencias/clase04/04-login-incorrecto-campos.png' 
        });

        const dialogPromise = new Promise<string>((resolve) => {
            page.once('dialog', async (dialog) => {
                await dialog.accept();
                resolve(dialog.message());
            });
        });

        await page.locator('#logInModal').getByRole('button', { name: 'Log in' }).click();
        const mensajeAlert = await dialogPromise;

        expect(mensajeAlert).toBeTruthy();
        console.log(`Error mostrado: ${mensajeAlert}`);

        const usuarioLogueado = page.locator('#nameofuser');
        await expect(usuarioLogueado).not.toBeVisible();
    });



    // ==========================================
    // TESTS RETO DE LA TAREA 04
    // ==========================================

    // Reto 1: Formulario con fill() en "Place Order"
    test('Reto 1 - Llenar formulario Place Order en el carrito', async ({ page }) => {
        await page.goto('/');
        
        // Agregar un producto rápido al carrito para poder ir a "Place Order"
        await page.waitForSelector('.card-title a');
        await page.locator('.card-title a').first().click();
        
        page.once('dialog', async (dialog) => await dialog.accept());
        await page.getByText('Add to cart').click();
        await page.waitForTimeout(1500);

        // Ir al carrito
        await page.locator('#navbarExample').getByRole('link', { name: 'Cart', exact: true }).click();
        await page.waitForURL('**/cart.html');

        // Abrir el modal "Place Order"
        await page.getByRole('button', { name: 'Place Order' }).click();
        await page.waitForSelector('#orderModal', { state: 'visible' });

        // Llenar el formulario usando fill()
        await page.locator('#name').fill('Usuario Prueba');
        await page.locator('#country').fill('Guatemala');
        await page.locator('#city').fill('Guatemala City');
        await page.locator('#card').fill('4532000000001234');
        await page.locator('#month').fill('12');
        await page.locator('#year').fill('2026');

        // Verificar que el botón "Purchase" sea visible
        const botonPurchase = page.getByRole('button', { name: 'Purchase' });
        await expect(botonPurchase).toBeVisible();
    });

    // Reto 2: Cerrar un modal con el botón "Close" (.last())
    test('Reto 2 - Cerrar modal de login usando el boton Close', async ({ page }) => {
        await page.goto('/');
        await page.locator('#navbarExample').getByRole('link', { name: 'Log in', exact: true }).click();
        
        const modalLogin = page.locator('#logInModal');
        await page.waitForSelector('#logInModal', { state: 'visible' });

        // Hay múltiples botones "Close" en los modales; se usa .last() para obtener el correcto
        await modalLogin.getByRole('button', { name: 'Close' }).last().click();

        // Verificar que el modal de login se haya ocultado
        await expect(modalLogin).not.toBeVisible();
    });

    // Reto 3: Usar clear() e inputValue()
    test('Reto 3 - Limpiar un campo con clear() y verificar con inputValue()', async ({ page }) => {
        await page.goto('/');
        await page.locator('#navbarExample').getByRole('link', { name: 'Log in', exact: true }).click();
        await page.waitForSelector('#logInModal', { state: 'visible' });

        const campoUsuario = page.locator('#loginusername');

        // Llenar el campo con un texto
        await campoUsuario.fill('texto_temporal');
        expect(await campoUsuario.inputValue()).toBe('texto_temporal');

        // Limpiar el campo
        await campoUsuario.clear();

        // Verificar que el campo quedó vacío
        const valorLimpio = await campoUsuario.inputValue();
        expect(valorLimpio).toBe('');
    });

});