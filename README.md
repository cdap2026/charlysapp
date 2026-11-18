# Punto de Juego · Ciencia en movimiento

Espacio de trabajo profesional para **evaluar postura con cámara**, registrar **mediciones morfométricas y biométricas**, y analizar la **técnica durante rutinas de ejercicio**.

Versión mejorada a partir de la app original [Punto de Juego](https://cdap2026.github.io/deportesfaro/) con foco en calidad de cámara, registros detallados y una pestaña dedicada a postura en ejercicio.

---

## Funcionalidades

### 1. Cámara mejorada
- Cámara **HD (1080p / 720p)** con selección de dispositivo y cambio frontal/trasera.
- Vista en espejo, **temporizador de 3 segundos**, guías de alineación y pantalla completa.
- **Análisis local con MediaPipe Pose Landmarker** (modelo alojado en `public/mediapipe`, sin peticiones externas).
- Detección de los **33 puntos anatómicos** con suavizado temporal, indicador de puntos visibles y barrido de escaneo.
- Carga de **fotografías** (JPG/PNG/WebP) con el mismo motor de detección.
- Mensajes claros para permisos denegados, cámara en uso, sin dispositivo o encuadre incompleto.
- El video **nunca sale del dispositivo**: solo se guarda la captura que se confirma.

### 2. Registros morfo / biométricos detallados
- Tabla con los **33 puntos**: nombre, región, coordenadas X/Y/Z, visibilidad y **observación individual por punto** (persistida).
- **17 campos** de medición manual agrupados en morfometría, composición y signos vitales, con descripción técnica, unidad y límites de validación.
- Historial de mediciones con cambio respecto al registro anterior, fuente y exportación **CSV**.
- Índice de masa corporal calculado (peso / estatura²) con aviso de interpretación profesional.

### 3. Pestaña de rutinas de ejercicios
- Sentadilla, zancada, press de hombros y plancha con claves de técnica y plano recomendado.
- **Conteo de repeticiones** y sostenimiento a partir de ángulos detectados, con fase del movimiento en vivo.
- Tiempo de sesión, ángulo articular actual y objetivo de rango.
- Las sesiones se guardan como evaluaciones de tipo `rutina` en la base de datos.

### 4. Interfaz, gráficos 3D y animaciones
- **Renders 3D propios** en `public/images` (10 imágenes en total): escultura de atleta en el Resumen con órbitas en perspectiva e **inclinación interactiva** al mover el ratón, escaneo corporal en la guía de captura, sentadilla en Rutinas, figura anatómica en *Nueva evaluación*, equipo en Deportistas, escalones de progreso en Historial y anillos de medición en Morfometría.
- **Revelado al hacer scroll** con `IntersectionObserver` (atributo `data-reveal`), con respaldo automático si la API no está disponible.
- **Esqueleto que se dibuja** (`pathLength` + `stroke-dashoffset`), puntos con rebote, **barrido de escaneo** y marcas pulsantes cuando la cámara está activa; borde pulsante en la tarjeta de cámara.
- **Contadores animados** en la puntuación, estadísticas y métricas; viñeta, shimmer en la carga y microinteracciones de hover (tarjetas, filas, flechas).
- Entradas escalonadas de tarjetas, modales con escala/desenfoque y toasts con rebote.
- Todo el movimiento se desactiva con `prefers-reduced-motion`.

### 5. Gestión y seguimiento
- Perfiles de deportista, cambio rápido de atleta, resumen y barras de navegación.
- Evaluaciones posturales (frontal/lateral/posterior) con captura, ángulos e índice orientativo.
- Historial unificado con filtros, búsqueda y **exportación CSV**.
- Diseño responsive (escritorio, tableta y móvil) y sistema de animaciones con soporte de `prefers-reduced-motion`.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Estilos | Tailwind CSS 4 (`src/app/globals.css` con capa de utilidades y sistema propio) |
| Base de datos | PostgreSQL + Drizzle ORM |
| Visión | `@mediapipe/tasks-vision` (Pose Landmarker, ejecución local en navegador) |
| Iconos | `lucide-react` |
| Tipografía | Manrope alojada localmente en `public/fonts` |

---

## Requisitos

- Node.js 20+ y npm.
- PostgreSQL 14+ accesible localmente (o una URL de base de datos remota).
- Navegador moderno con soporte de cámara. **La cámara requiere HTTPS** (o `localhost`).

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/punto-de-juego.git
cd punto-de-juego

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env y definir DATABASE_URL

# 4. Crear las tablas en PostgreSQL
npx drizzle-kit push

# 5. Arrancar en desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

En la primera carga se insertan automáticamente **registros de demostración** claramente etiquetados como *Muestra*, para explorar la interfaz sin cargar datos reales.

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Cadena de conexión de PostgreSQL | `postgresql://postgres:postgres@127.0.0.1:5432/app_db` |

> El resto de secretos, si se añaden en el futuro, deben leerse en el servidor (`process.env.NUNCA_EXPOSTA`). Nunca se exponen variables sin prefijo `NEXT_PUBLIC_` al navegador.

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run start` | Arranque de producción |
| `npm run typecheck` | Comprobación de tipos (`tsc --noEmit`) |
| `npm run lint` | Análisis con ESLint |
| `npx drizzle-kit push` | Aplica el esquema de `src/db/schema.ts` a PostgreSQL |
| `npx next typegen` | Genera los tipos de rutas |

### Pruebas end-to-end (opcional)

```bash
npx playwright install chromium   # una sola vez
npm run build && npm run start    # en otra terminal
node scripts/smoke-test.mjs
```

El smoke test valida: permiso de cámara con dispositivo simulado, carga del modelo local, análisis real de 33 puntos, creación de deportista, mediciones, observación por punto, exportación CSV, borrado, validación de errores y navegación móvil sin desbordamientos.

---

## Estructura del proyecto

```
├── public/
│   ├── fonts/                     # Manrope (local, sin dependencia de CDNs)
│   ├── images/                    # Render 3D y fotografías de referencia
│   └── mediapipe/                 # WASM + modelo pose_landmarker_lite.task
├── scripts/
│   └── smoke-test.mjs             # Pruebas E2E con Playwright
├── src/
│   ├── app/
│   │   ├── globals.css            # Tailwind + sistema visual y de animación
│   │   ├── layout.tsx             # Tipografía local y metadatos
│   │   ├── page.tsx               # Página principal (server component)
│   │   └── api/
│   │       ├── health/route.ts    # Healthcheck de base de datos
│   │       └── workspace/route.ts CRUD de deportistas, evaluaciones y mediciones
│   ├── components/
│   │   ├── camera-panel.tsx       # Cámara, detección, guías y captura
│   │   ├── forms.tsx              # Formularios y detalle por punto
│   │   ├── records.tsx            # Registros morfo/biométricos e historial
│   │   ├── routines.tsx           # Pestaña de rutinas y conteo de repeticiones
│   │   ├── ui.tsx                 # Modales, anillo de puntuación, contadores
│   │   └── workspace.tsx          # Shell, navegación y estados globales
│   ├── db/
│   │   ├── index.ts               # Pool de PostgreSQL + Drizzle
│   │   └── schema.ts              # Tablas: athletes, evaluations, measurements
│   └── lib/
│       ├── pose.ts                # 33 landmarks, ángulos, mediciones, ejercicios
│       ├── store.ts               # Consultas y datos de demostración
│       └── types.ts               # Tipos compartidos
├── .env.example
├── .gitignore
└── drizzle.config.json
```

---

## Modelo de datos

- **`athletes`** — perfil: nombre, edad, sexo, deporte, estatura, peso.
- **`evaluations`** — tipo (`postural` | `rutina`), vista, 33 landmarks (JSONB), métricas, **observaciones por punto** (JSONB), captura, notas, ejercicio, repeticiones y duración.
- **`measurements`** — valores (JSONB), notas/método, marca de demostración y fecha.

---

## Publicar en GitHub

```bash
git init
git add .
git commit -m "Punto de Juego: evaluación postural con cámara, registros biométricos y rutinas"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/punto-de-juego.git
git push -u origin main
```

`.env` y artefactos de prueba ya están excluidos en `.gitignore`. Solo se versionan `.env.example` y los assets necesarios (`public/mediapipe` ≈ 25 MB, por debajo del límite de 100 MB por archivo de GitHub).

Para desplegar en Vercel u otro PaaS: configurar `DATABASE_URL` en el panel de entornos y ejecutar `npx drizzle-kit push` una vez contra la base de datos de producción.

---

## Limitaciones y aviso

- Los ángulos y el índice de simetría son **estimaciones 2D orientativas**: dependen de la perspectiva, la oclusión y la calidad de la cámara.
- Las mediciones corporales y los signos vitales se registran **manualmente**; la cámara no estima composición corporal.
- Las imágenes en 3D de la interfaz son **visualizaciones de referencia**, no escáneres reales.
- Esta herramienta **no sustituye una valoración profesional ni ofrece diagnóstico**. Detener cualquier ejercicio ante dolor.
- El espacio no incluye autenticación: evita introducir información clínica sensible.

---

Licencia: uso educativo y de demostración.
