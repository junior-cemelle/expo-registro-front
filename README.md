# ExpoRegistro — Frontend

Interfaz web para el sistema académico de gestión de exposiciones. Permite a alumnos, docentes y administradores registrar equipos, calendarizar exposiciones y registrar evaluaciones por rúbrica.

---

## Tabla de contenidos

- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Instalación local](#instalación-local)
- [Variables de entorno](#variables-de-entorno)
- [Páginas y rutas](#páginas-y-rutas)
- [Roles de usuario](#roles-de-usuario)
- [Funcionalidades principales](#funcionalidades-principales)
- [Componentes reutilizables](#componentes-reutilizables)
- [Diseño y estilos](#diseño-y-estilos)
- [Fondo rotatorio](#fondo-rotatorio)
- [Despliegue en Vercel](#despliegue-en-vercel)

---

## Tecnologías

| Paquete | Versión | Uso |
|---|---|---|
| React | 18.3 | Biblioteca de UI |
| TypeScript | 5.7 | Tipado estático |
| Vite | 6.0 | Bundler y servidor de desarrollo |
| React Router DOM | 6.28 | Enrutamiento SPA |
| Tailwind CSS | 3.4 | Utilidades de estilos |
| Framer Motion | 11.13 | Animaciones |
| Zustand | 5.0 | Estado global (auth) con persistencia |
| React Hook Form | 7.54 | Formularios |
| Zod | 3.24 | Validación de esquemas |
| Recharts | 3.8 | Gráficas (radar, barras) |
| Sonner | 1.7 | Notificaciones toast |
| Radix UI | — | Dropdown, Avatar (accesibles) |

---

## Estructura del proyecto

```
frontend/
├── public/
│   └── resources/
│       ├── logo_lince.png       # Logo institucional
│       ├── bg-dashboard.jpg     # Fondo inicial del dashboard
│       ├── landscape-1.jpg      # Fondos rotativos (agregar manualmente)
│       ├── landscape-2.jpg
│       ├── landscape-3.jpg
│       └── landscape-4.jpg
├── src/
│   ├── components/
│   │   ├── admin/               # Componentes CRUD reutilizables
│   │   │   ├── DataTable.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── PageHeader.tsx
│   │   ├── ConstellationCanvas.tsx  # Animación de constelaciones
│   │   ├── Icon.tsx                 # Wrapper Material Symbols
│   │   ├── navbar.tsx               # Barra superior (logo + perfil)
│   │   ├── RotatingBackground.tsx   # Fondo de paisajes con crossfade
│   │   └── Sidebar.tsx              # Navegación lateral
│   ├── hooks/
│   │   ├── useCrud.ts           # Hook genérico para CRUD con búsqueda
│   │   └── useStudentData.ts    # Grupos y equipos del alumno autenticado
│   ├── layouts/
│   │   └── DashboardLayout.tsx  # Layout con sidebar + navbar + fondo
│   ├── lib/
│   │   ├── api.ts               # Cliente HTTP + tipos de entidades
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx        # Vista distinta por rol
│   │   ├── Perfil.tsx           # Edición de datos del usuario
│   │   ├── admin/               # CRUD para administradores
│   │   │   ├── Materias.tsx
│   │   │   ├── Grupos.tsx
│   │   │   ├── Alumnos.tsx
│   │   │   ├── Equipos.tsx
│   │   │   ├── Exposiciones.tsx
│   │   │   ├── Criterios.tsx
│   │   │   └── Evaluaciones.tsx
│   │   └── student/             # Vistas de consulta para alumnos/docentes
│   │       ├── Materias.tsx
│   │       ├── Grupos.tsx
│   │       ├── Alumnos.tsx
│   │       ├── Equipos.tsx
│   │       ├── Exposiciones.tsx
│   │       └── Evaluaciones.tsx
│   ├── stores/
│   │   └── auth.ts              # Zustand: token, usuario, setAuth, setUser, logout
│   ├── App.tsx                  # Rutas y guardias
│   ├── index.css                # Estilos globales + utilidades glass
│   └── main.tsx
├── tailwind.config.ts
├── vite.config.ts
├── vercel.json
└── .env.local                   # Variables de entorno (no commitear)
```

---

## Instalación local

### Requisitos previos

- Node.js ≥ 20
- npm ≥ 9 (o pnpm/yarn equivalente)
- Backend de ExpoRegistro corriendo (local o en Railway)

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd expo-registro/frontend

# 2. Instalar dependencias
npm install

# 3. Crear el archivo de variables de entorno
cp .env.example .env.local
# Editar .env.local con la URL del backend (ver sección siguiente)

# 4. Iniciar servidor de desarrollo
npm run dev
```

El servidor queda disponible en `http://localhost:5173`.

### Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción (`dist/`) |
| `npm run preview` | Previsualizar el build de producción |

---

## Variables de entorno

Crear un archivo `.env.local` en la raíz de `frontend/`:

```env
VITE_API_URL=https://tu-backend.up.railway.app/api/v1
```

> En desarrollo local apuntar a `http://localhost:8080/api/v1` si el backend corre en ese puerto.

El cliente HTTP (`src/lib/api.ts`) usa esta variable con fallback a `http://localhost:8080/api/v1` si no está definida.

---

## Páginas y rutas

### Rutas públicas (sin autenticación)

| Ruta | Componente | Descripción |
|---|---|---|
| `/login` | `Login` | Inicio de sesión. Redirige al dashboard si ya hay sesión. |
| `/register` | `Register` | Registro de cuenta de alumno. |

### Rutas protegidas (requieren token)

| Ruta | Vista admin | Vista alumno/docente |
|---|---|---|
| `/dashboard` | Panel con accesos rápidos a módulos | Estadísticas personales y equipos |
| `/materias` | CRUD de materias | Mis materias con equipo asignado |
| `/grupos` | CRUD de grupos | Mis grupos inscritos |
| `/alumnos` | CRUD de usuarios | Compañeros por grupo |
| `/equipos` | CRUD de equipos | Equipos por grupo (el propio resaltado) |
| `/exposiciones` | CRUD de exposiciones | Exposiciones por grupo con botón de evaluar |
| `/evaluaciones` | Listado completo de evaluaciones | Evaluaciones realizadas + radar del equipo |
| `/perfil` | — (compartida) | Edición de datos personales y contraseña |

### Rutas solo admin

| Ruta | Descripción |
|---|---|
| `/criterios` | CRUD de criterios de evaluación |
| `/admin` | Panel de acceso rápido a todos los módulos |
| `/admin/materias` … `/admin/evaluaciones` | Alias directos a las páginas CRUD |

### Comportamiento de enrutamiento

- Si no hay sesión activa y se intenta acceder a una ruta protegida → redirige a `/login`.
- Si hay sesión y se intenta acceder a `/login` o `/register` → redirige a `/dashboard`.
- Un alumno/docente que accede a `/criterios` o rutas `/admin/*` → redirige a `/dashboard`.
- Cualquier ruta desconocida → redirige a `/dashboard`.

---

## Roles de usuario

| Rol | Acceso |
|---|---|
| `admin` | CRUD completo de todas las entidades, gestión de criterios, panel de administración |
| `docente` | Mismas vistas que `alumno` (lectura + evaluación) |
| `alumno` | Consulta de materias, grupos, compañeros, equipos, exposiciones y evaluaciones propias |

El componente `RoleSwitch` en `App.tsx` selecciona automáticamente la vista correcta según el rol almacenado en la sesión.

---

## Funcionalidades principales

### Autenticación

- Login con email y contraseña. Token JWT almacenado en Zustand con persistencia en `localStorage` y cookie `auth-token`.
- Detección de cierre de sesión en otra pestaña mediante `StorageEvent`.
- Token expirado → limpia sesión y redirige a `/login` automáticamente.

### Dashboard de alumno

- Tarjetas de estadísticas: grupos inscritos, equipos, evaluaciones realizadas, promedio personal.
- Skeleton animado durante la carga.
- Lista de equipos con miembros.
- Gráfica de barras de promedio por criterio (Recharts).
- Listado de evaluaciones recientes.

### Evaluación de exposiciones

- Cada alumno puede evaluar las exposiciones de otros equipos (no las propias).
- Modal con sliders por criterio (0–10, paso 0.5).
- Indicador visual de estado: "Evaluado", "Evaluar" o "No puedes evaluarte".
- Promedio calculado en tiempo real en el modal.

### Vista de evaluaciones recibidas

- Gráfica de radar (Recharts) con promedios por criterio por exposición.
- Barras de progreso animadas por criterio.
- Lista expandible de evaluaciones realizadas con detalle por criterio.

### Filtrado en vistas de alumno (frontend)

Todas las páginas de alumno incluyen un campo de búsqueda instantánea:

| Página | Filtra por |
|---|---|
| Materias | Nombre de materia, clave, grupo |
| Grupos | Nombre de grupo, materia, ciclo escolar |
| Alumnos | Nombre, apellido, número de control |
| Equipos | Nombre del equipo |
| Exposiciones | Tema |
| Evaluaciones | ID de exposición, fecha |

### Filtrado en vistas de administrador (backend)

Las páginas CRUD del administrador envían el término de búsqueda al backend (ilike):

| Página | Parámetro API |
|---|---|
| Materias | `nombre` |
| Grupos | `nombre_grupo` |
| Alumnos | `nombre` (busca también en apellido) |
| Equipos | `nombre_equipo` |
| Exposiciones | `tema` |
| Criterios | `nombre_criterio` |

### Perfil de usuario

- Edición de nombre, apellido y correo electrónico.
- Cambio de contraseña opcional (nueva + confirmación). El backend hashea con bcrypt automáticamente.
- Actualiza el estado de Zustand al guardar (sin necesidad de volver a iniciar sesión).

---

## Componentes reutilizables

### `useCrud<T>` (`src/hooks/useCrud.ts`)

Hook genérico para páginas CRUD. Maneja paginación, búsqueda, estado de carga y operaciones save/remove con toast automático.

```ts
const crud = useCrud<Grupo>({
  fetch: (page, search) => api.grupos.list({ page, size: 10, nombre_grupo: search }),
})
```

Expone: `data`, `loading`, `page`, `search`, `saving`, `deleting`, `load`, `changePage`, `changeSearch`, `save`, `remove`.

### `DataTable` (`src/components/admin/DataTable.tsx`)

Tabla con paginación, skeleton de 5 filas, estado vacío, y acciones de editar/eliminar que aparecen al hacer hover.

### `Modal` y `ConfirmDialog`

Modal animado con cierre por ESC. `ConfirmDialog` muestra un diálogo de confirmación antes de eliminar con estado de carga.

### `Icon` (`src/components/Icon.tsx`)

Wrapper sobre Material Symbols Rounded. Acepta `filled` para activar el relleno vía `font-variation-settings`.

```tsx
<Icon name="school" className="text-[24px] text-brand-400" filled />
```

### `RotatingBackground` (`src/components/RotatingBackground.tsx`)

Dos capas permanentes que hacen crossfade CSS cada 10 segundos. Solo rota entre imágenes que cargaron exitosamente. Ver sección [Fondo rotatorio](#fondo-rotatorio).

---

## Diseño y estilos

### Sistema de diseño

- **Estilo**: Dark glass morphism sobre fondo de paisaje oscurecido.
- **Fuente**: Google Sans (cargada vía CDN en `index.html`), fallback DM Sans / system-ui.
- **Iconos**: [Material Symbols Rounded](https://fonts.google.com/icons) vía CDN.
- **Paleta de marca**: `brand-400` `#818cf8`, `brand-500` `#6366f1`, `brand-600` `#4f46e5`.

### Clases de utilidad personalizadas (`index.css`)

| Clase | Descripción |
|---|---|
| `.glass` | Fondo translúcido con blur (para tarjetas) |
| `.glass-dark` | Variante más oscura (navbar) |
| `.glass-input` | Inputs con fondo semi-transparente y foco violeta |
| `.glass-select` | Selects con mismo estilo que glass-input |

### Animaciones Tailwind personalizadas (`tailwind.config.ts`)

| Clase | Comportamiento |
|---|---|
| `animate-float` | Bob suave `translateY(0 → -12px)` de 6 s (logo de login) |
| `animate-pulse-slow` | Pulse lento de 4 s |

### Scrollbar

Scrollbar delgado de 5 px con pista transparente. El HTML tiene `scrollbar-gutter: stable` + `overflow-y: scroll` para que el ancho del viewport no cambie al aparecer/desaparecer el scrollbar, evitando que el fondo se desplace.

---

## Fondo rotatorio

El componente `RotatingBackground` carga paisajes desde `public/resources/` y hace crossfade entre ellos cada 10 segundos sin parpadeo.

### Cómo agregar imágenes

1. Descarga 3–4 fotos de paisajes (recomendado: [unsplash.com/s/photos/landscape](https://unsplash.com/s/photos/landscape)).
2. Guárdalas en `frontend/public/resources/` con estos nombres exactos:

```
landscape-1.jpg
landscape-2.jpg
landscape-3.jpg
landscape-4.jpg
```

3. El componente detecta automáticamente qué archivos cargaron y solo rota entre los disponibles. Con un solo archivo no hay rotación pero sí se muestra el fondo.

> `bg-dashboard.jpg` ya está incluido y sirve como primera imagen de la rotación.

### Cómo funciona (sin bug de re-fade)

Dos divs permanentes (`slot 0` y `slot 1`) alternan como capa frontal/trasera:

1. Se carga la siguiente imagen en el slot **invisible** (opacidad 0) → sin cambio visual.
2. Se dispara el crossfade CSS `opacity 1.5s ease-in-out`.
3. Al terminar, solo cambia la **etiqueta** de qué slot es frontal; los valores de opacidad ya son correctos → el `transition` CSS no se dispara por segunda vez.

---

## Despliegue en Vercel

### Configuración

El archivo `vercel.json` redirige todas las rutas a `index.html` para soporte de SPA:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Pasos

1. Conectar el repositorio de GitHub a Vercel.
2. Configurar el directorio raíz del proyecto como `frontend/`.
3. Agregar la variable de entorno en el panel de Vercel:
   ```
   VITE_API_URL = https://tu-backend.up.railway.app/api/v1
   ```
4. Vite detecta automáticamente el framework; el comando de build es `npm run build` y el directorio de salida es `dist/`.
5. Cada push a la rama `main` despliega automáticamente.

---

## Notas de desarrollo

- El alias `@/` apunta a `src/` (configurado en `vite.config.ts` y `tsconfig.app.json`).
- Los errores 401 del API limpian la sesión automáticamente y redirigen a `/login`, excepto en el endpoint de login donde se usa `skipAuthRedirect: true`.
- Las rutas `/login` y `/register` redirigen al dashboard si ya existe una sesión activa.
- Los formularios usan React Hook Form con resolvers Zod para validación unificada en cliente.
