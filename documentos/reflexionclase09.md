# Reflexión y Discusión — Clase 09: Fixtures y Tests Parametrizados

**Curso:** Aseguramiento de la Calidad del Software  
**Estudiante:** Entrega Individual  
**Materia:** Automatización de Pruebas con Playwright  

---

### 1. ¿Cuántas líneas de código ahorraste usando el loop de parametrización?

**Análisis cuantitativo:**
* **Sin parametrización:** Escribir cada caso de prueba de forma manual e individual (3 escenarios de login + 3 escenarios de adición de productos al carrito) requeriría declarar 6 bloques `test(...)` independientes con sus respectivas instrucciones de navegación, locators, clics y aserciones. Esto representaría entre **80 y 90 líneas de código**.
* **Con parametrización (Data-Driven Testing):** Al concentrar los valores cambiantes en arrays (`usuariosDeLogin` y `productosAVerificar`) y recorrerlos con bucles `for...of`, el código ejecutable se redujo a unas **30 líneas efectivas**.

**Conclusión:**  
Se logró un ahorro aproximado de **50 a 60 líneas de código duplicado**. Además de la reducción volumétrica, se aplica el principio **DRY (Don't Repeat Yourself)**: si el selector de un botón o la estructura del DOM en SauceDemo cambia en el futuro, solo se debe actualizar una sola línea de lógica en lugar de modificar 6 pruebas distintas.

---

### 2. ¿Qué pasa si agregas un 4to usuario al array `usuariosDeLogin`?

**Comportamiento en la ejecución:**
* Playwright genera dinámicamente el plan de ejecución en la fase de descubrimiento (*test collection phase*) antes de arrancar los navegadores.
* Al añadir un cuarto objeto al array con la estructura `{ username, password, esperadoURL, descripcion }`, el loop generará automáticamente un **décimo test** en la suite (sumando los 3 tests de fixtures + 4 tests de login + 3 tests de productos = 10 tests en total).
* El runner evaluará el caso sin requerir ninguna modificación en la lógica del test: si `esperadoURL` contiene un patrón de expresión regular, validará el acceso correcto; si es `null`, validará que el contenedor `[data-test="error"]` sea visible.

**Impacto:** Permite escalar la matriz de cobertura funcional (por ejemplo, validando usuarios con caracteres especiales, bloqueos por intentos fallidos, etc.) de forma puramente declarativa.

---

### 3. ¿Cómo podrías leer los datos de prueba desde un archivo CSV externo?

Para desacoplar completamente la capa de datos de la lógica de automatización en TypeScript:

1. **Instalación de dependencias:**  
   Se utiliza una librería de parsing rápido compatible con Node.js/TypeScript, como `csv-parse`:
   ```bash
   npm install --save-dev csv-parse
   ```

2. **Lectura y procesamiento síncrono:**  
   Playwright requiere que la definición de los tests sea sincrónica para registrar las pruebas antes de la ejecución. Se combina el módulo `fs` de Node.js con `parse` de `csv-parse/sync`:

   ```typescript
   import fs from 'fs';
   import path from 'path';
   import { parse } from 'csv-parse/sync';
   import { test, expect } from '@playwright/test';

   // Leer y parsear el archivo CSV de forma sincrónica
   const csvFilePath = path.resolve(__dirname, '../data/usuarios.csv');
   const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

   interface UsuarioCSV {
     username: string;
     password: string;
     esperadoURL: string;
     descripcion: string;
   }

   const registros: UsuarioCSV[] = parse(fileContent, {
     columns: true,
     skip_empty_lines: true,
     trim: true,
   });

   // Generación dinámica de tests a partir del dataset externo
   test.describe('Login con datos desde CSV', () => {
     for (const usuario of registros) {
       test(`Login CSV: ${usuario.descripcion}`, async ({ page }) => {
         await page.goto('https://www.saucedemo.com');
         await page.locator('#user-name').fill(usuario.username);
         await page.locator('#password').fill(usuario.password);
         await page.locator('#login-button').click();

         if (usuario.esperadoURL) {
           await expect(page).toHaveURL(new RegExp(usuario.esperadoURL));
         } else {
           await expect(page.locator('[data-test="error"]')).toBeVisible();
         }
       });
     }
   });
   ```

**Ventaja estratégica:**  
Cualquier integrante del equipo de QA o negocio puede alimentar nuevos casos de prueba, matrices de bordes o variantes de usuario editando únicamente una hoja de cálculo o archivo `.csv`, sin riesgo de alterar el código fuente de las pruebas automatizadas.