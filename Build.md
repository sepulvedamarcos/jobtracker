# Cómo crear un ejecutable portable de JobTracker

Este documento describe los pasos para generar un ejecutable que se pueda instalar via `npm install -g` y funcione en cualquier sistema operativo, similar a como funcionan Claude Code o Gemini CLI.

## Requisitos previos

- Node.js 18+ instalado
- npm 9+
- TypeScript configurado
- Git

## Pasos

### 1. Configurar como paquete npm

En `package.json`, asegurar que tienes:

```json
{
  "name": "jobtracker",
  "version": "0.0.1",
  "description": "TUI para búsqueda y seguimiento de empleo",
  "bin": {
    "jobtracker": "./dist/cli/app.js"
  },
  "preferGlobal": true,
  "scripts": {
    "build": "tsc",
    "prepublish": "npm run build"
  }
}
```

- `bin` aponta al archivo que se ejecutará como comando
- `preferGlobal` indica que es una herramienta de línea de comandos

### 2. Compilar TypeScript

```bash
npm run build
```

Esto genera `dist/cli/app.js` desde `src/infrastructure/adapters/cli/app.tsx`.

### 3. Crear el ejecutable portable

Usar [pkg](https://github.com-vercel.com/pkg/pkg) o [nexe](https://github.com/nexe/nexe):

#### Opción A: pkg (recomendada para multi-plataforma)

```bash
npm install -g pkg
pkg dist/cli/app.js --targets node18-linux-x64,node18-macos-x64,node18-win-x64 --output jobtracker
```

Esto genera executables para Linux, macOS y Windows.

#### Opción B: nexe

```bash
npm install -g nexe
nexe dist/cli/app.js -t node18 -o jobtracker
```

### 4. Publicar en npm (opcional)

```bash
npm publish
```

Después de esto, cualquier persona puede instalar con:

```bash
npm install -g jobtracker
jobtracker
```

### 5. Alternativa: usando npx directo

Si no quieres publicar, puedes usar npx directamente:

```bash
npx @sepulvedamarcos/jobtracker
```

Para esto, necesitas publicar el paquete en npm registry.

## Solución recomendada para MVP

Usar **pkg** porque:

- Genera binarios nativos standalone
- No requiere Node.js instalado en el usuario
- Funciona en Windows, macOS y Linux
- Soporta múltiples arquitecturas

## Comandos de ejemplo

```bash
# Instalar pkg
npm install -g pkg

# Compilar
npm run build

# Generar binarios
pkg dist/cli/app.js \
  --targets node18-linux-x64,node18-macos-x64,node18-win-x64 \
  --output jobtracker

# Linux
./jobtracker-linux

# macOS  
./jobtracker-macos

# Windows
jobtracker-win.exe
```

## Notas

- El entry point (`bin`) debe ser un archivo `.js`, no `.tsx`
- Asegurarse de que `dist/` está en `.gitignore`
- El binario incluye Node.js runtime, aumentando el tamaño (~50-80MB)
- Para缩减 tamaño, usar flag `--compress` de pkg

## Recursos

- [pkg](https://github.com/vercel/pkg)
- [nexe](https://github.com/nexe/nexe)
- [npm publish](https://docs.npmjs.com/cli/v10/commands/npm-publish)
- [npm bin](https://docs.npmjs.com/cli/v10/commands/npm-bin)