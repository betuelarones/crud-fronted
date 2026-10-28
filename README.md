# Overskul Frontend

Panel de administración para el CRUD de productos y categorías. Construido con **Vue 3**, **TypeScript**, **Vite**, **Pinia** y **Tailwind CSS 4**. Consume la API Laravel del proyecto `crud-backend`.

## Stack

- Vue 3 con `<script setup>` y Composition API
- TypeScript y Vue Router
- Pinia para estado global
- Axios con manejo centralizado de errores
- Tailwind CSS 4 (plugin oficial de Vite)
- Lucide para iconografía
- Vitest + Vue Test Utils para pruebas

## Funcionalidades

- Dashboard con totales, accesos rápidos y últimos productos.
- Listado de productos con búsqueda, filtro por categoría, paginación y eliminación confirmada.
- Formulario de creación y edición de productos con validación local y errores del servidor.
- Listado de categorías con búsqueda, paginación y conteo de productos.
- Creación y edición de categorías en modal.
- Manejo del error `409` al intentar eliminar categorías con productos activos.
- Estados de carga, vacío, éxito y error en todas las vistas.
- Confirmaciones antes de eliminar y mensajes de éxito auto-ocultables.
- Diseño responsive con navegación lateral.

## Requisitos

- Node.js 22.18+ o 24.12+
- pnpm 12+
- API Laravel en ejecución

## Instalación

```powershell
pnpm install
Copy-Item .env.example .env
pnpm dev
```

Abre `http://localhost:5173`.

## Docker (WSL + Nginx)

El frontend incluye un build Docker que compila con Vite y sirve los archivos estáticos con Nginx. El backend debe estar levantado en `http://localhost:8000`.

Requisitos:

- Docker Desktop con integración para Ubuntu en WSL 2.
- Backend Docker en ejecución.

```bash
cd vue-frontend
docker compose up -d --build
```

Abre `http://localhost:8080`.

El contenedor compila con:

```dotenv
VITE_API_BASE_URL=/api/v1
VITE_API_DOCS_URL=/api/docs
```

Nginx sirve la SPA y hace proxy de `/api` y `/telescope` hacia `host.docker.internal:8000`, por lo que el navegador usa el mismo origen y no necesita CORS. Para detenerlo:

```bash
docker compose down
```

## Variables de entorno

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_API_DOCS_URL=http://127.0.0.1:8000/api/docs
```

El archivo `.env` está ignorado por Git; usa `.env.example` como referencia.

## Rutas

| Ruta | Vista |
| --- | --- |
| `/` | Dashboard |
| `/products` | Listado de productos |
| `/products/new` | Crear producto |
| `/products/:id/edit` | Editar producto |
| `/categories` | Gestión de categorías |
| `*` | Página no encontrada |

## Scripts

```powershell
pnpm dev          # Servidor de desarrollo
pnpm build        # Type-check y build de producción
pnpm type-check   # Verificación de tipos con vue-tsc
pnpm test         # Pruebas con Vitest
pnpm test:watch   # Pruebas en modo watch
pnpm preview      # Previsualizar el build
```

## Integración con la API

- El cliente Axios vive en `src/services/http.ts` y normaliza los errores en `ApiError`.
- Las respuestas esperadas son `{ success, message, data }`.
- Los listados usan `data.items` y `data.pagination`.
- Los errores `422` alimentan `validationErrors` en los stores y se muestran junto a cada campo.
- Las peticiones de listado usan un identificador incremental para ignorar respuestas obsoletas.
- CORS del backend está permitido para `http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:8080` y `http://127.0.0.1:8080`.

## Estructura

```text
src/
  assets/main.css        Tailwind y estilos base
  components/            Botones, alertas, modales, paginación, estados
  layouts/AppLayout.vue  Shell con sidebar
  router/index.ts        Rutas y lazy loading
  services/              Axios y endpoints de la API
  stores/                Estado de productos y categorías
  types/                 Tipos compartidos
  utils/                 Formato, errores y validación
  views/                 Dashboard, productos, formulario, categorías, 404
```

## Pruebas y verificación

```powershell
pnpm test
pnpm build
```

Resultado verificado:

- **18 pruebas aprobadas** en 3 archivos: validaciones, stores (carga, errores `422`, mensajes de éxito, `404`, `409`) y montaje de las vistas principales.
- `vue-tsc` sin errores.
- Build de producción generado correctamente.
- Verificado contra la API real: página servida por Vite, `GET /api/v1/categories` con CORS y preflight `OPTIONS` correctos.

## Flujo de uso

1. Crea una categoría en **Categorías**.
2. Crea productos asociándolos a categorías activas.
3. Busca, filtra y edita desde **Productos**.
4. Elimina con confirmación; los registros usan eliminación lógica en la API.
