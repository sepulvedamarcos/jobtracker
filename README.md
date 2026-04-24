# JobTracker 🚀

<p align="center">
  <a href="./README.md"><strong>Español</strong></a> ·
  <a href="./README.en.md">English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white" alt="Node.js badge" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript badge" />
  <img src="https://img.shields.io/badge/Ink-000000?logo=react&logoColor=61DAFB" alt="Ink badge" />
  <img src="https://img.shields.io/badge/License-GPLv3-blue.svg" alt="GPLv3 badge" />
</p>

**JobTracker** es una TUI de búsqueda y seguimiento de empleo которая centraliza avisos, palabras clave y postulaciones en una sola interfaz rápida de terminal.

## Pantalla principal

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 JobTracker v0.0.2    [Plugins: 1] [Keywords: 3]          │
│  Status: Bienvenido! Sin datos previos.                     │
├────────────────────────────┬────────────────────────────────┤
│  📋 Avisos Capturados      │  📬 Postulaciones              │
│  ──────────────────────    │  ──────────────────            │
│  1. Senior Developer...    │  1. Backend Dev - TechCorp     │
│     Bumeran | hace 2d     │     LinkedIn | 15/04/2026      │
│  2. Node.js Engineer...   │  2. Full Stack - StartupX       │
│     Computrabajo | hace 3d│     Indeed | 10/04/2026         │
├────────────────────────────┴────────────────────────────────┤
│  📝 Detalle: Senior Developer @ TechCorp                    │
│     Keywords: [nodejs] [backend] [remote]                  │
│     📅 20/04/2026 | 🔗 https://...                          │
├─────────────────────────────────────────────────────────────┤
│  [S] Escanear  [K] Keywords  [P] Plugins  [Tab] Panel  [Q]  │
└─────────────────────────────────────────────────────────────┘
```

## Hotkeys

### Navegación
| Tecla | Acción |
|-------|--------|
| `↑` / `↓` | Navegar entre registros del panel activo |
| `Tab` | Cambiar entre paneles (Avisos → Postulaciones → Detalle) |
| `PageUp` / `PageDown` | Paginar en el panel activo |

### Acciones rápidas
| Tecla | Panel | Acción |
|-------|-------|--------|
| `Enter` | Avisos | Copiar aviso a postulaciones |
| `Enter` | Postulaciones | Abrir detalle de postulación |
| `Enter` | Detalle | Abrir enlace del aviso en navegador |
| `Supr` | Modal Detalle | Eliminar postulación seleccionada |

### Funciones globales
| Tecla | Acción |
|-------|--------|
| `S` | Iniciar escaneo con plugins |
| `K` | Abrir modal de keywords |
| `P` | Abrir panel de plugins |
| `Q` | Salir de la aplicación |

### Modal de Keywords (K)
| Tecla | Acción |
|-------|--------|
| `I` | Insertar nueva keyword |
| `Enter` | Guardar keyword (en modo inserción) |
| `Supr` / `Del` | Eliminar keyword seleccionada |
| `Esc` | Cerrar modal |

### Modal de Plugins (P)
| Tecla | Acción |
|-------|--------|
| `A` | Agregar plugin (ingresar ruta .scrapper) |
| `E` | Eliminar plugin seleccionado |
| `Enter` | Instalar plugin (en modo instalación) |
| `Esc` | Cerrar modal |

## Opciones CLI

### Comandos npm

```bash
# Desarrollo - TUI completa
npm run dev

# Con escaneo automático al iniciar
npm run dev:find

# Agregar keyword sin entrar a TUI
npm run dev:add -- "nodejs"

# Eliminar keyword sin entrar a TUI
npm run dev:del -- "nodejs"

# Modo silencioso (sin TUI)
npm run dev:silent

# Imprimir jobs guardados
npm run print:jobs

# Gestión de plugins
npm run dev:plugin          # Abrir TUI con plugins en modo desarrollo
npm run dev:plugin:find     # Plugin + escaneo automático
npm run dev:install-plugin  # Instalar plugin por ruta
```

### Flags directos

```bash
# Escanear al iniciar
npx tsx src/infrastructure/adapters/cli/app.tsx --find

# Sin splash screen
npx tsx src/infrastructure/adapters/cli/app.tsx --noSplash

# Agregar keyword
npx tsx src/infrastructure/adapters/cli/app.tsx --addKey "backend"

# Eliminar keyword
npx tsx src/infrastructure/adapters/cli/app.tsx --delKey "backend"

# Instalar plugin
npx tsx src/infrastructure/adapters/cli/app.tsx --addPlugin "/ruta/al/plugin.scrapper"

# Ver ayuda completa
npx tsx src/infrastructure/adapters/cli/app.tsx --help
```

## Screenshots

### 1. Splash
Pantalla de arranque que muestra la versión y estado de carga.

![Splash](./images/image_1.png)

### 2. Entorno principal
Vista del layout con los tres paneles y footer de atajos.

![Main Layout](./images/image_2.png)

### 3. Diálogo de detalle
Modal centrado para agregar o eliminar palabras clave.

![Detail Modal](./images/image_3.png)

## Stack técnico

- **Lenguaje**: TypeScript

Para más detalles sobre la arquitectura, patrones y especificaciones técnicas, consulta el [SPEC.md](./SPEC.md) (disponible también en [inglés](./Spec.en.md)).

## Instalación

```bash
npm install
npm run dev
```

## Contribuir

1. Haz un fork del repositorio
2. Crea una rama (`git checkout -b feature/mi-cambio`)
3. Haz commit de tus cambios
4. Sube tu rama
5. Abre un Pull Request

## Contacto

<p align="center">
  <a href="https://www.linkedin.com/in/sepulvedamarcos">
    <img src="https://img.shields.io/badge/LinkedIn-Marcos%20Sep%C3%BAlveda-blue?logo=linkedin&logoColor=white" />
  </a>
  <a href="mailto:sepulvedamarcos@gmail.com">
    <img src="https://img.shields.io/badge/Email-sepulvedamarcos%40gmail.com-red?logo=gmail&logoColor=white" />
  </a>
  <a href="https://ko-fi.com/sepulvedamarcos">
    <img src="https://img.shields.io/badge/Ko--fi-Apoyar%20con%20un%20caf%C3%A9-ff5e5b?logo=kofi&logoColor=white" />
  </a>
</p>

---

Hecho para quienes prefieren automatizar su búsqueda de empleo sin perder el control de sus datos.