# Bug Report - BR-CLASE11-001
**Título:** Imágenes rotas: dos imágenes no cargan en /broken-images
**Fecha:** 15 de octubre de 2026
**Reportado por:** Marvin Vásquez
**Ambiente:** Windows 11, Firefox, https://practice.expandtesting.com/broken-images

## Descripción
En la página de pruebas de imágenes rotas, dos de las tres imágenes presentes en el cuerpo principal no se renderizan debido a que sus recursos asociados devuelven un código de estado HTTP 404 (Not Found).

## Severidad: Media
No bloquea la navegación general del sitio, pero impide la visualización correcta del contenido gráfico en el módulo.

## Prioridad: P3
Es un defecto visual/cosmético relevante en la sección de demostración, a corregir en el flujo regular.

## Frecuencia: Siempre
Ocurre en cada recarga de la página en Firefox y Chromium.

## Pasos para reproducir
1. Navegar a https://practice.expandtesting.com/broken-images
2. Inspeccionar las etiquetas `<img>` del contenido principal.
3. Revisar en la pestaña Red (Network) de las herramientas de desarrollo el estado de carga de cada recurso.

## Resultado esperado
Todas las imágenes cargan correctamente (`HTTP 200`) y su propiedad `naturalWidth` es mayor a 0.

## Resultado obtenido
Las imágenes `asdf.jpg` e `hjkl.jpg` devuelven error `HTTP 404` y tienen `naturalWidth = 0`.

## Evidencia
Detectado mediante la prueba automatizada `tests/clase11.spec.ts` y verificable en la pestaña Network de la traza de Playwright.

## Notas adicionales
Defecto identificado con el tag `@bug` y controlado temporalmente en la suite con `test.fail()`.