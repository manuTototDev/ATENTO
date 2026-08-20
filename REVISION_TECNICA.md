# Revisión técnica — Lemmatica (carpeta `Atento`)

**Fecha:** 20 de agosto de 2026 · **Rama:** `dev` (sincronizada con `origin/dev`)
**Stack:** React 19 + Vite 8 · Node/Express 5 · Prisma 7 + PostgreSQL (Supabase) · Google Gemini

---

## 1. Qué es y en qué estado está

Plataforma de documentación clínica para médicos independientes en México: registro de pacientes,
consulta asistida por IA (voz → SOAP + receta), agenda, inventario, tabulador de precios y un
"data lake" anonimizado para analítica.

El backend está bastante sólido en su capa de seguridad (JWT + refresh en cookie httpOnly, bcrypt 12
rondas, helmet, rate limiting, bloqueo por intentos fallidos, validación Zod). **El problema está en
que el frontend y el backend no hablan el mismo idioma en varias páginas clave**, y en que el
esquema de base de datos se adelantó a las migraciones. Es un MVP funcional en la ruta principal
(login → onboarding → consulta), con varias pantallas rotas en silencio.

---

## 2. Bloqueadores (rompen funcionalidad hoy)

### 2.1 Cinco páginas llaman a la API sin token → 401 permanente
`Dashboard.jsx`, `PatientDirectory.jsx`, `PatientDetail.jsx`, `Analytics.jsx` y `PrescriptionView.jsx`
usan `fetch('http://localhost:5000/api/...?userId=' + userId)` en crudo, sin el header
`Authorization`. Todos esos endpoints están protegidos con `authenticateToken` y además ignoran el
`?userId=` (el backend toma la identidad del JWT). Resultado: el dashboard, el directorio de
pacientes, el detalle de paciente, la vista de receta y analytics **siempre reciben 401 y renderizan
vacío**, sin mensaje de error. Borrar un paciente nunca funciona.
→ **Fix:** reemplazar por `apiFetch` y eliminar el parámetro `?userId=`.

### 2.2 `apiFetch` cierra la sesión en errores legítimos
`utils/api.js:27` trata 401 **y 403** como "token expirado": intenta refresh, y si falla borra el
storage y hace `window.location.href='/login'`, devolviendo `null`.
Consecuencias en cadena:
- **Login con contraseña incorrecta** (401) → borra la sesión, recarga la página y muestra "Error de
  conexión con el servidor" en lugar de "credenciales inválidas". Mismo patrón en `Register` y
  `Onboarding`. El login no debería pasar por `apiFetch`.
- Acceder al paciente de otro médico (403 legítimo del backend) **te desloguea**.
- `apiFetch` puede devolver `null` y ~20 llamadas hacen `res.json()` sin guardia → `TypeError`
  silencioso. Solo `Consultation.jsx:93,100` usa `res?.json()`.

### 2.3 Guardar consulta desde `/consultation/new` siempre falla
`Consultation.jsx:190` envía `patientId: id`, y en esa ruta `id === 'new'`. El schema Zod exige
`z.string().uuid()` → 400 garantizado. La consulta nunca se guarda desde la ruta nueva.

### 2.4 Deriva entre `schema.prisma` y las migraciones
Las migraciones se detienen en `20260503221545_agenda_inventory_models`. **No existe migración**
para: `Medication`, `ConsultationAudio`, las tres tablas `Analytics*`, `icd10Code`,
`rawTranscription`, ni el tabulador de precios (`basePrice`, `nightPrice`, …). La base actual
seguramente se construyó con `db push`. Una instalación limpia con `prisma migrate deploy`
**no reproduce el esquema** — esto bloquea cualquier despliegue a producción o staging.
→ **Fix:** `npx prisma migrate dev --name add_analytics_audio_icd10_pricing`.

### 2.5 `components/Layout.jsx` y los CSS no llegaron al staging
`App.jsx` importa `./components/Layout`, que existe en disco pero está vacío o incompleto según el
diff. Además `Sidebar.jsx` importa `Outlet` y **nunca lo renderiza**: si el sidebar es el layout,
todas las rutas anidadas (`/dashboard`, `/patients`, `/calendar`, `/finances`, `/settings`)
renderizarían solo el sidebar. Vale la pena verificar en `npm run dev`.

### 2.6 Bucle infinito en `PrescriptionView.jsx:26-43`
El `useEffect` depende de `[patient, id]` y llama `setPatient(...)` dentro. Si el paciente devuelto
no trae `firstName`, la condición sigue verdadera → **fetch en bucle infinito**.

---

## 3. Seguridad y cumplimiento (crítico: son datos de salud)

| # | Hallazgo | Riesgo |
|---|---|---|
| 3.1 | **Sin protección de rutas.** `App.jsx` no tiene `ProtectedRoute`. Cualquier visitante anónimo entra a `/dashboard`, `/patients`, `/consultation/new`. | Alto |
| 3.2 | `localStorage.getItem('userId')` es el único chequeo de "estoy logueado" en 11 páginas, y se envía al servidor como identidad en `Onboarding.jsx:148` y `NewPatient.jsx:51`. Falsificable desde devtools. | Alto |
| 3.3 | El access token vive en `localStorage` → legible por cualquier XSS, en una app con PHI. Considerar token en memoria + refresh en cookie. | Alto |
| 3.4 | `POST /api/admin/sync-datalake` **no valida rol ADMIN** (comentado en el código como pendiente). Cualquier médico autenticado puede disparar el ETL completo. | Medio-alto |
| 3.5 | **No hay RBAC en ningún endpoint.** El enum `Role` (ADMIN/DOCTOR/ASSISTANT) existe en el esquema pero nunca se consulta. | Medio |
| 3.6 | El refresh token no es revocable ni rotativo: no hay denylist ni versión de sesión. Un refresh robado sirve 7 días. | Medio |
| 3.7 | `Consultation.jsx` usa la **Web Speech API del navegador**. En Chrome eso envía el audio de la consulta a los servidores de Google — un tratamiento de datos de salud que probablemente no está cubierto por tus Términos ni por un contrato con proveedor. Además es Chrome/Edge only, sin fallback. | Alto (legal) |
| 3.8 | `twoFactorEnabled` / `twoFactorSecret` en el esquema, sin implementación. No existe recuperación de contraseña. | Medio |
| 3.9 | `PrescriptionView.jsx:105-106` imprime **`Céd. Prof. 12345678` y "UNAM" como fallback** si el perfil está incompleto. Es una receta médica con validez legal: una cédula falsa impresa es un problema serio. Debe bloquear la impresión, no inventar el dato. | Alto (legal) |
| 3.10 | `Consultation.jsx:153` manda `'El paciente refiere dolor de cabeza'` a la IA cuando la transcripción está vacía: texto clínico fabricado que puede terminar en un expediente. | Alto |
| 3.11 | El "data lake anonimizado" **reusa el `id` del paciente y de la consulta como PK analítica** y guarda `doctorId` en claro. Es pseudonimización, no anonimización: reidentificable con un solo join. El comentario del código lo asume seguro; no lo es bajo LFPDPPP. | Medio-alto |
| 3.12 | `.env` correctamente ignorado y sin rastro en el historial de git. ✅ Bien. Pero `http://localhost:5000` en texto plano ×11 y la advertencia de que en producción todo debe ir por HTTPS. | — |
| 3.13 | Audio guardado como `base64` en una columna `Text` de Postgres (ya anotado en el esquema). Con `express.json({limit:'10mb'})` una consulta de 15 min no cabe, y la tabla crecerá sin control. | Medio |

---

## 4. Calidad de datos y lógica de negocio

- **`/api/analytics` devuelve datos falsos:** `monthlyRevenue` está hardcodeado (`Ene: 4000, Feb: 3000…`)
  con el total real solo en "May". Las Finanzas del médico muestran números inventados.
- **Dashboard:** `recentConsults` nunca se llena (no hay endpoint `GET /api/consultations`), y
  "Consultas Hoy" muestra `totalAppointments` — un acumulado histórico etiquetado como métrica del día.
- **El `plan` de la consulta es ambiguo:** a veces texto SOAP, a veces `JSON.stringify({treatments, indications})`.
  `dataLakeSync` intenta `JSON.parse(c.plan)` y silencia el error con `catch(e){}`, así que cuando el
  plan es texto libre **el conteo de tratamientos y todas las `AnalyticsPrescription` se pierden en silencio**.
  Los tratamientos deberían ser columnas/tabla propia, no JSON en un campo de texto.
- **El ETL no escala:** `syncDataLake` hace `findMany` de *todos* los pacientes con *todas* sus consultas
  y luego un `upsert` por registro. Sin `lastSyncedAt`, sin lotes. Con unos miles de consultas revienta
  memoria o tarda horas.
- **Cálculo de tarifa nocturna:** compara strings (`"21:30" >= "20:00"`) y usa `new Date()` del servidor
  (UTC en la nube) sin zona horaria. Un médico en México con servidor UTC facturará tarifa nocturna a
  partir de las 14:00 hora local.
- **Edad en el ETL:** el truco `new Date(diffMs).getUTCFullYear() - 1970` es frágil; usar diferencia de años.
- **`POST /api/patients`** envuelve alergias en array de un solo elemento: `allergies ? [allergies] : []`.
  El esquema soporta múltiples, el endpoint acepta solo una.
- **`NewPatient.jsx`** acepta fecha de nacimiento como tres campos libres sin validar:
  `"99/99/1"` se envía tal cual.
- **`CalendarView.jsx`** no valida que `endTime > startTime`, ni fechas pasadas, ni `Invalid Date`.
- **Endpoints faltantes:** `GET /api/consultations`, `GET /api/consultations/:id`,
  `PUT/DELETE /api/inventory/:id`, `PUT /api/appointments/:id`, `PUT /api/patients/:id`.
  Sin ellos no hay historial de consultas ni edición.
- **`Analytics.jsx` e `Inventory.jsx` están completas pero sin ruta en `App.jsx`** — páginas muertas.

---

## 5. Código y mantenibilidad

- **El repo tiene dos sistemas de diseño mezclados.** 11 páginas usan estilos inline "brutalistas"
  (blanco/negro); `NewPatient`, `PatientDetail`, `Inventory` y `Analytics` usan clases + variables CSS
  de un diseño anterior (`--primary`, `.clean-panel`, `.data-table`). Navegar de `/patients` a
  `/patients/:id` cambia de lenguaje visual.
- **Duplicación pesada:** `COMMON_SPECIALTIES` + `COMMON_UNIVERSITIES` (~90 líneas) copiadas literalmente
  en `Onboarding.jsx` y `Settings.jsx`; `fetchLocationFromZip` duplicada; el encabezado
  "Dr. {nombre} / especialidad / engrane" copiado en 5 archivos, **cada uno con su propio
  `GET /api/profile`** (6 páginas piden el mismo perfil). Un `AuthContext` + `useProfile` resolvería las tres cosas.
- **Formato de dirección incompatible:** `Onboarding` escribe `…, C.P. 11000`, `Settings` parsea con
  `.replace('CP ', '')` → el código postal vuelve como `"C.P. 11000"`.
- `updateTreatment` / `updateIndication` en `Consultation.jsx` **mutan el estado en sitio**
  (copian el array pero comparten los objetos de fila).
- `key={index}` en listas con borrado (`Consultation.jsx:371,462`) → React reutiliza inputs equivocados
  al eliminar una fila del medio.
- El reconocimiento de voz **no tiene cleanup** en el `useEffect`: salir de la consulta deja el micrófono activo.
  Tampoco hay `onend`, así que cuando Chrome corta por silencio la UI sigue diciendo "grabando".
- Sin loading ni UI de error en el fetch inicial de 6 páginas: un 500 se ve igual que "no hay datos".
- ~20 imports sin usar (9 de 11 iconos en `Settings.jsx`). Botones sin `onClick`:
  "Guardar Borrador" (`Consultation.jsx:504`), "Filtros" y editar paciente en `PatientDirectory`.
- "Descargar PDF" e "Imprimir" hacen ambos `window.print()`; no hay generación de PDF.
- **Accesibilidad:** modales sin `role="dialog"` ni foco atrapado ni Escape; la acción principal
  "Iniciar Consulta" es un `<div onClick>` (no enfocable ni operable con teclado); `<label>` sin `htmlFor`;
  todo el feedback es `onMouseOver` (nada para teclado); contraste `#888` sobre blanco y `#666` sobre negro
  por debajo de WCAG AA.
- **Scripts de desarrollo en la raíz del backend:** `check_db.js`, `check_users.js`, `clear_db.js`,
  `test.js`, `test-ai.js`, `test-db.js`, `create_table.js`. `clear_db.js` borrando datos junto al
  código de producción es un accidente esperando ocurrir → mover a `scripts/` o `tools/`.
- **`package.json` del backend sin scripts:** no hay `start` ni `dev`; `test` es el placeholder de npm.
  Cero pruebas automatizadas en todo el proyecto.

---

## 6. Estado de git

- **Todo el árbol de trabajo está sin commitear**: 32 archivos modificados. Pero el 97 % de ese diff
  (9 934 inserciones / 9 841 eliminaciones) es **ruido de fin de línea CRLF↔LF**. El cambio real son
  ~247 líneas en 12 archivos.
  → **Fix:** agregar un `.gitattributes` con `* text=auto eol=lf` y hacer un commit único de
  normalización, para que los diffs futuros sean legibles.
- `Terminos_y_Condiciones_Lemmatica.docx` está marcado como añadido en el índice pero borrado del disco (`AD`).
- `frontend/vite.sandbox.config.js` sin trackear.
- El README describe "WebSockets para streaming de audio" y "Gemini 2.0 Flash". La realidad:
  **no hay WebSocket en ninguna parte** (`ws` está en `package.json` sin usarse), el audio nunca sale
  del navegador, y el modelo real es `gemini-2.5-pro`. La UI muestra "Gemini 1.5" al usuario.
  Tres versiones distintas del mismo hecho.

---

## 7. Plan sugerido, en orden

**Semana 1 — que funcione lo que ya existe**
1. Cambiar los 5 archivos con `fetch` crudo a `apiFetch`; quitar `?userId=`.
2. Arreglar `apiFetch`: no tratar 403 como expiración, no usarlo para login/registro, y devolver un
   objeto de error en lugar de `null`.
3. `patientId` real en `Consultation.jsx` (seleccionar paciente antes de abrir `/consultation/new`).
4. Cortar el bucle de `PrescriptionView` y eliminar los fallbacks de cédula/universidad.
5. Quitar el texto clínico inventado del fallback de la IA.
6. `prisma migrate dev` para cerrar la deriva del esquema.
7. `.gitattributes` + commit de normalización de fin de línea.

**Semana 2 — seguridad**
8. `ProtectedRoute` + `AuthContext` (una sola fuente de verdad para sesión y perfil).
9. Verificación de rol ADMIN en `/api/admin/sync-datalake` y RBAC básico donde aplique.
10. Sacar el token de `localStorage`; refresh rotativo y revocable.
11. Decidir el tema de la transcripción: si el audio no puede ir a Google, hay que mover el ASR al
    backend (Gemini multimodal, que además es lo que el README ya promete) o a un proveedor con contrato.
12. Revisar la "anonimización" del data lake: hashear IDs con sal, o separar la base analítica de verdad.

**Semana 3 — datos y producto**
13. `monthlyRevenue` real; endpoint `GET /api/consultations` para el historial y el dashboard.
14. Sacar `treatments` del campo `plan` a su propia tabla — arregla el ETL de paso.
15. Zona horaria del médico para el tabulador de tarifas.
16. `lastSyncedAt` + lotes en el ETL.
17. Unificar el sistema de diseño; enrutar o borrar `Analytics` e `Inventory`.
18. Configuración por entorno (`VITE_API_URL`), scripts `start`/`dev`, y una primera batería de pruebas
    sobre auth y el guardado de consultas.
