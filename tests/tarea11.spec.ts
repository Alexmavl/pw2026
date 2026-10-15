import { test, expect } from '@playwright/test';

const BASE_URL = 'https://practice.expandtesting.com';

test.describe('Tests reto: documentar defectos con Playwright', () => {

  // Reto 3: Borrador de reporte desde un afterEach
  test.afterEach(async ({ page }, testInfo) => {
    // Si el test arrojó errores durante la aserción o falló su ejecución
    if (testInfo.errors.length > 0 || testInfo.status !== testInfo.expectedStatus) {
      const borradorReporte = `# Borrador de Reporte de Defecto

**Título:** ${testInfo.title}
**Ambiente:** ${testInfo.project.name} (${process.platform})
**URL:** ${page.url()}
**Resultado obtenido:**
\`\`\`text
${testInfo.error?.message || 'Error detectado durante la validación del test'}
\`\`\`
`;

      await testInfo.attach('borrador-reporte.md', {
        body: borradorReporte,
        contentType: 'text/markdown',
      });
    }
  });

  // Reto 1: Medir un defecto intermitente
  test('Reto 1: Medir un defecto intermitente en /typos', async ({ page }, testInfo) => {
    test.setTimeout(90000);

    let erroresDetectados = 0;
    const totalRecargas = 12;

    await page.goto(`${BASE_URL}/typos`);

    for (let i = 0; i < totalRecargas; i++) {
      if (i > 0) {
        await page.reload();
      }

      // Localizador del párrafo que cambia en /typos
      const parrafo = page.locator('.container p').nth(1);
      const texto = await parrafo.innerText();

      // En /typos el defecto intermitente cambia "won't" por "won,t"
      if (texto.includes('won,t')) {
        erroresDetectados++;
      }
    }

    const frecuencia = `${erroresDetectados} de ${totalRecargas} (${((erroresDetectados / totalRecargas) * 100).toFixed(1)}%)`;

    // Adjuntar la frecuencia con testInfo.attach
    await testInfo.attach('frecuencia-defecto-intermitente', {
      body: `Frecuencia del defecto de texto: ${frecuencia}`,
      contentType: 'text/plain',
    });

    // Agregar la anotación del test
    testInfo.annotations.push({
      type: 'intermittent-bug',
      description: `Frecuencia observada: ${frecuencia}`,
    });

    expect(totalRecargas).toBe(12);
  });

  // Reto 2: test.fixme con una anotación de issue
  test(
    'Reto 2: Validar texto sin errores ortográficos en /typos',
    {
      annotation: {
        type: 'issue',
        // Asegúrate de colocar la URL que te generó tu GitHub CLI
        description: 'https://github.com/Alexmavl/Pw2026/issues/1',
      },
    },
    async ({ page }) => {
      // Deja el test escrito sin ejecutarlo mientras el defecto siga abierto (genera skipped)
      test.fixme(true, 'Defecto abierto: errata ortográfica intermitente en el texto');

      await page.goto(`${BASE_URL}/typos`);
      const parrafo = page.locator('.container p').nth(1);
      await expect(parrafo).toContainText("you won't.");
    }
  );

  // Reto 3: Verificación del defecto en /broken-images
  test('Reto 3: Imágenes rotas en /broken-images', async ({ page }) => {
    // test.fail(true) documenta el defecto conocido: espera el fallo de las imágenes rotas
    // y mantiene el resultado general del test en passed
    test.fail(true, 'BUG-001: asdf.jpg y hjkl.jpg responden con 404');

    await page.goto(`${BASE_URL}/broken-images`);
    const imagenes = page.locator('main img');

    await expect.poll(() => imagenes.evaluateAll(
      imgs => imgs.every(img => (img as HTMLImageElement).complete),
    )).toBe(true);

    const anchos = await imagenes.evaluateAll(
      imgs => imgs.map(img => (img as HTMLImageElement).naturalWidth),
    );

    // Falla si alguna imagen no cargó (naturalWidth === 0), cumpliendo el test.fail esperado
    for (const ancho of anchos) {
      expect(ancho).toBeGreaterThan(0);
    }
  });

});