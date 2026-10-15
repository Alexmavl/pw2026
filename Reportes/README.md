# Aseguramiento de la Calidad del Software - Clase 11: Gestión de Bugs

Repositorio de prácticas y automatización de pruebas con Playwright para la **Clase 11: Gestión de Bugs: ciclo de vida del defecto, clasificación, reportes HTML, anotaciones y GitHub Issues**.

* **Estudiante:** Marvin Alexander Vásquez López
* **Ambiente de pruebas:** [Expand Testing - Practice Test Automation](https://practice.expandtesting.com)
* **Framework:** Playwright con TypeScript
* **Navegador objetivo:** Firefox

---

## Estructura del Proyecto

```text
├── evidencias/                 # Capturas generadas durante la ejecución de pruebas
├── reportes/
│   └── bug-report-clase11.md   # Reporte formal del defecto (BR-CLASE11-001)
├── tests/
│   ├── clase11.spec.ts         # Suite de laboratorio (9 tests)
│   └── tarea11.spec.ts         # Tests reto con técnicas de gestión de bugs
├── playwright.config.ts        # Configuración de reporters, traces y timeouts
├── package.json
└── README.md