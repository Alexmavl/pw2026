import { test as base, expect } from '@playwright/test';

// ============================================================================
// TIPOS DE FIXTURES
// ============================================================================
type TestFixtures = {
  cronometro: void;
};

type WorkerFixtures = {
  workerContador: { valor: number };
};

// ============================================================================
// EXTENSIÓN DE FIXTURES PERSONALIZADOS (Retos 1 y 2)
// ============================================================================
export const test = base.extend<TestFixtures, WorkerFixtures>({
  // Reto 1 — Fixture con teardown real
  // El setup inicia antes de use(); el teardown corre siempre al finalizar use()
  cronometro: async ({}, use) => {
    const inicio = Date.now();
    await use();
    const duracion = Date.now() - inicio;
    console.log(`[Teardown] Duración del test: ${duracion}ms`);
  },

  // Reto 2 — Fixture de alcance worker
  // Persiste su estado en memoria a lo largo de los tests asignados al mismo worker
  workerContador: [
    async ({}, use) => {
      const estado = { valor: 0 };
      await use(estado);
    },
    { scope: 'worker' },
  ],
});

export { expect };

// ============================================================================
// RETO 1: Fixture con teardown real
// ============================================================================
test.describe('Reto 1 - Fixture con teardown real', () => {
  test('Medición de tiempo con teardown garantizado', async ({ page, cronometro }) => {
    await page.goto('https://www.saucedemo.com');
    await expect(page).toHaveTitle(/Swag Labs/);
  });
});

// ============================================================================
// RETO 2: Fixture de alcance worker (Demostración de 1 a 2)
// Usamos .serial para asegurar la ejecución secuencial en el mismo worker
// ============================================================================
test.describe.serial('Reto 2 - Fixture de alcance worker', () => {
  test('Test A: Incrementa el contador a 1', async ({ workerContador }) => {
    workerContador.valor += 1;
    console.log(`Valor del contador (Test A): ${workerContador.valor}`);
    expect(workerContador.valor).toBe(1);
  });

  test('Test B: Incrementa el contador a 2 persistiendo el estado anterior', async ({ workerContador }) => {
    workerContador.valor += 1;
    console.log(`Valor del contador (Test B): ${workerContador.valor}`);
    expect(workerContador.valor).toBe(2);
  });
});

// ============================================================================
// RETO 3: test.use() + parametrización (Móvil y Escritorio)
// ============================================================================
const viewports = [
  { nombre: 'Escritorio', ancho: 1280, alto: 720 },
  { nombre: 'Móvil', ancho: 375, alto: 667 },
];

for (const vp of viewports) {
  test.describe(`Reto 3 - Viewport: ${vp.nombre}`, () => {
    test.use({ viewport: { width: vp.ancho, height: vp.alto } });

    test(`Carga visual de login en ${vp.nombre}`, async ({ page }) => {
      await page.goto('https://www.saucedemo.com');
      const botonLogin = page.locator('#login-button');
      await expect(botonLogin).toBeVisible();
    });
  });
}


// ============================================================================
// Explicación
// ============================================================================

//Detalles técnicos de cada reto
//Reto 1 (Teardown): Cualquier instrucción colocada después de await use() actúa como bloque de limpieza (teardown), ejecutándose incluso si las aserciones del test fallan.

//Reto 2 (Worker Scope): Al definir { scope: 'worker' }, el objeto workerContador se inicializa una sola vez por hilo de ejecución (worker) y no por cada test individual. La directiva test.describe.serial garantiza que corran en orden sobre el mismo worker para verificar el cambio de 1 a 2.

//Reto 3 (test.use() + loop): El bucle genera un bloque test.describe por cada resolución, aplicando la configuración de pantalla específica con test.use({ viewport: ... })).