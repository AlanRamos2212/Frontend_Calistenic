# Verificación PWA — CalistenicTrack

Corte: 25 de noviembre de 2026. Commit web: `545405b`.

## 1. PWA Angular principal (evidencia C2–C4)

Archivos fuente:

- `public/manifest.json`
- `public/icons/icon-192.png`, `icon-512.png`, `icon-maskable-192.png`, `icon-maskable-512.png`
- `ngsw-config.json`
- `src/index.html` con `<link rel="manifest" href="/manifest.json">` y `theme-color`
- `src/app/app.config.ts` con `provideServiceWorker('ngsw-worker.js', { enabled: !isDevMode(), registrationStrategy: 'registerWhenStable:30000' })`
- `angular.json` con `"serviceWorker": "ngsw-config.json"` en producción

Artefactos generados en `dist/frontend/browser`:

- `manifest.json`
- `ngsw.json`
- `ngsw-worker.js`
- `safety-worker.js` / `worker-basic.min.js`
- `icons/*.png`

Verificación en producción (`https://calistenic-web.onrender.com`):

| Ruta | Resultado | Content-Type |
|---|---|---|
| `/manifest.json` | HTTP 200 | `application/json` |
| `/ngsw.json` | HTTP 200 | `application/json` |
| `/ngsw-worker.js` | HTTP 200 | `application/javascript` |
| `/icons/icon-192.png` | HTTP 200 | `image/png` |
| `/index.html` | HTTP 200, contiene `/manifest.json` | `text/html` |

Comprobaciones adicionales:

- `GET /manifest.json` devuelve `"name": "CalistenicTrack — Monitor Atlético"`.
- `index.html` referencia `main-DRPBD4GI.js`; ese bundle contiene `ngsw-worker.js` y `registerWhenStable`.
- `ngsw.json` contiene `index=/index.html` y los grupos `app-shell` y `static-assets`.
- Build: `npm run build` OK (solo advertencias preexistentes de budget y `RouterLink`).
- Tests: `npm test -- --watch=false` → **3 archivos / 8 pruebas aprobadas**.

Comandos para repetir:

```powershell
cd 'C:\Proyectos Alan\Frontend_Calistenic'
npm run build
npm test -- --watch=false

$base='https://calistenic-web.onrender.com'
foreach($u in @('/manifest.json','/ngsw.json','/ngsw-worker.js','/icons/icon-192.png')){
  $h=curl.exe -s -m 60 -D - -o NUL ($base+$u)
  ($h | Select-String -Pattern '^HTTP/|^content-type:') | ForEach-Object { $_.Line }
}
```

## 2. Apéndice — dashboard Flutter embebido (evidencia secundaria)

Rutas:

- `/flutter-dashboard/manifest.json` → HTTP 200, `application/json`
- `/flutter-dashboard/flutter_service_worker.js` → HTTP 200, `application/javascript`
- `/flutter-dashboard/index.html` → HTTP 200 y contiene `<link rel="manifest" href="manifest.json">`

El manifiesto del dashboard declara `display: standalone`, `start_url: "."` e iconos 192/512. Sin embargo su `flutter_service_worker.js` llama a `self.registration.unregister()` al activarse y no implementa caché offline. Por eso se presenta como **evidencia secundaria de configuración PWA**, no como reemplazo del Service Worker Angular.

## 3. Alcance de la simulación D2

El panel BLE muestra explícitamente:

> "Modo simulación: los valores de frecuencia cardíaca se generan localmente y no provienen de un sensor BLE."

La app del reloj también etiqueta sus métricas como demostración y el botón dice "Simular lectura". El código real de Web Bluetooth existe en `src/app/ble.service.ts`, pero no se conecta a la UI en la demo; no se reclama lectura de sensores reales.
