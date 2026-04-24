# JobTracker 🚀

[English](./README.en.md)

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Ink-000000?logo=react&logoColor=61DAFB" alt="Ink" />
  <img src="https://img.shields.io/badge/License-GPLv3-blue.svg" alt="GPLv3" />
</p>

**JobTracker** es una TUI para buscar y seguir ofertas de empleo que centraliza avisos, palabras clave y postulaciones en una sola interfaz rapida de terminal.

*La herramienta que te ayuda a no perder el control de tu busqueda de empleo.*

## Por que JobTracker?

En vez de abrir multiples pestanas y volver a filtrar los mismos portales una y otra vez, JobTracker te da una vista unica, ordenada y operable desde teclado.

- **Rapido y ligero**: construido con React + Ink para una experiencia agil en consola.
- **Extensible por diseño**: sistema de plugins para agregar nuevos portales de empleo.
- **Datos en tu maquina**: toda la informacion se guarda localmente en JSON.
- **Productividad primero**: escaneo, keywords, postulaciones y pluginspensados como partes del mismo sistema.

## Que lo hace diferente

- **Un solo lugar**: todos los avisos de diferentes portales en una lista unificada.
- **Keywords automaticas**: busca por las palabras que configures en todos los plugins.
- **Seguimiento de postulaciones**: marca a donde aplicaste y su estado.
- **Plugins de terceros**: cualquier desarrollador puede crear nuevos scrapers.

## Arquitectura

JobTracker sigue principios de ingenieria pragmatica:

- **Clean Architecture**: separacion entre logica de negocio e infraestructura.
- **Screaming Architecture**: la estructura del proyecto refleja su proposito.
- **Hexagonal Architecture**: puertos y adaptadores para aislar el core.
- **Repository Pattern**: acceso a datos detras de interfaces.

## Capturas de pantalla

### Splash
Pantalla de arranque con version e indicadores de estado.

### Entorno principal
Vista de tres paneles con navegacion por teclado.

### Dialogo de keywords
Modal para gestionar palabras clave de busqueda.

## Hotkeys

### Navegacion

| Tecla | Accion |
|-------|--------|
| `↑` / `↓` | Navegar entre registros del panel activo |
| `Tab` | Cambiar entre paneles (Avisos → Postulaciones → Detalle) |
| `PageUp` / `PageDown` | Paginar en el panel activo |

### Acciones rapidas

| Tecla | Panel | Accion |
|-------|-------|--------|
| `Enter` | Avisos | Copiar aviso a postulaciones |
| `Enter` | Postulaciones | Abrir detalle de postulacion |
| `Enter` | Detalle | Abrir enlace del aviso en navegador |
| `Supr` | Modal Detalle | Eliminar postulacion seleccionada |

### Funciones globales

| Tecla | Accion |
|-------|--------|
| `S` | Iniciar escaneo con plugins |
| `K` | Abrir modal de keywords |
| `P` | Abrir panel de plugins |
| `Q` | Salir de la aplicacion |

### Modal de Keywords (K)

| Tecla | Accion |
|-------|--------|
| `I` | Insertar nueva keyword |
| `Enter` | Guardar keyword (en modo insercion) |
| `Supr` / `Del` | Eliminar keyword seleccionada |
| `Esc` | Cerrar modal |

### Modal de Plugins (P)

| Tecla | Accion |
|-------|--------|
| `A` | Agregar plugin (ingresar ruta .scrapper) |
| `E` | Eliminar plugin seleccionado |
| `Enter` | Instalar plugin (en modo instalacion) |
| `Esc` | Cerrar modal |

## Opciones CLI

### Instalacion global

Una vez publicado, puedes instalar JobTracker como paquete npm:

```bash
npm install -g sepulvedamarcos-jobtracker
jobtracker --help
```

### Uso global

```bash
# Ver ayuda
jobtracker --help

# Escaneo automatico al iniciar
jobtracker --find

# Sin splash screen
jobtracker --noSplash

# Agregar keyword
jobtracker --addKey "python"

# Eliminar keyword
jobtracker --delKey "python"

# Modo silencioso (escaneo sin TUI)
jobtracker --silent

# Instalar plugin desde archivo .scrapper
jobtracker --addPlugin "/ruta/al/plugin.scrapper"
```

### Instalacion local (desarrollo)

```bash
npm install
npm run dev
```

### Uso local

```bash
# TUI completa
npm run dev

# Con escaneo automatico al iniciar
npm run dev:find

# Agregar keyword sin entrar a TUI
npm run dev:add -- "python"

# Eliminar keyword sin entrar a TUI
npm run dev:del -- "python"

# Modo silencioso (sin TUI)
npm run dev:silent

# Imprimir jobs guardados
npm run print:jobs

# Gestion de plugins (desarrollo)
npm run dev:plugin          # Abrir TUI con plugins en modo desarrollo
npm run dev:plugin:find     # Plugin + escaneo automatico
```

## Plugins

JobTracker es **extensible**. Puedes agregar plugins para diferentes portales de empleo.

### Plugins disponibles

- **trabajando.cl** - Portal chileno de empleos con mas de 15 portales
- **computrabajo.cl** - Portal latinoamericano (en desarrollo)

### Crear tu propio plugin

JobTracker tiene un **Plugin SDK** que te permite crear scrapers para cualquier portal de empleo.

Consulta [plugin-sdk/README.md](./plugin-sdk/README.md) para la documentacion completa.

```bash
# Validar estructura del plugin
npx tsx plugin-sdk/scripts/validate.ts --name mi-plugin

# Compilar TypeScript a JavaScript
npx tsx plugin-sdk/scripts/build.ts --name mi-plugin

# Probar el plugin
npx tsx plugin-sdk/scripts/test.ts --name mi-plugin --keywords "python,react"

# Empaquetar para distribucion
npx tsx plugin-sdk/scripts/pack.ts --name mi-plugin
```

## Stack tecnico

- **Lenguaje**: TypeScript
- **Runtime**: Node.js
- **UI**: React + Ink
- **CLI**: Commander
- **Paths**: env-paths
- **Persistencia**: JSON local
- **Scraping**: Playwright

Para mas detalles sobre la arquitectura, patrones y especificaciones tecnicas, consulta el [SPEC.md](./SPEC.md).

## Contribuir

Las contribuciones son bienvenidas, ya sea reportando bugs, proponiendo mejoras o enviando codigo.

1. Haz un fork del repositorio
2. Crea una rama (`git checkout -b feature/mi-cambio`)
3. Haz commit de tus cambios
4. Sube tu rama
5. Abre un Pull Request

## Contacto

<p align="center">
  <a href="https://www.linkedin.com/in/sepulvedamarcos">
    <img src="https://img.shields.io/badge/LinkedIn-Marcos%20Sep%C3%BAlveda-blue?logo=linkedin&logoColor=white" alt="LinkedIn" />
  </a>
  <a href="mailto:sepulvedamarcos@gmail.com">
    <img src="https://img.shields.io/badge/Email-sepulvedamarcos%40gmail.com-red?logo=gmail&logoColor=white" alt="Email" />
  </a>
  <a href="https://ko-fi.com/sepulvedamarcos">
    <img src="https://img.shields.io/badge/Ko--fi-Apoyar%20con%20un%20caf%C3%A9-ff5e5b?logo=kofi&logoColor=white" alt="Ko-fi" />
  </a>
</p>

---

Si te gusta, considera darle una estrella al repositorio.