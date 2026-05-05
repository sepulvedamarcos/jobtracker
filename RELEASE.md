# Guía de Publicación de JobTracker

Este documento describe el proceso y requisitos para publicar una nueva versión del paquete a npm.

## Requisitos Previos

### 1. Cuenta de npm
- Tener una cuenta en [npmjs.com](https://www.npmjs.com)
- **2FA habilitado** en la cuenta (requerido por npm desde 2025)
- Ser maintainer del paquete `jobtracker`

### 2. Acceso al repositorio
- Tener permisos de escritura en el repositorio de GitHub
- Acceso a la configuración del paquete en npmjs.com

### 3. Trusted Publisher configurado
El paquete ya tiene configurado OIDC (Trusted Publishing) en npmjs.com. Esto permite publicar sin tokens. Verificado en:
- URL: `https://www.npmjs.com/package/jobtracker/settings`
- Sección: Trusted Publisher

## Flujo de Publicación

### Paso 1: Verificar que estás en main

```bash
git checkout main
git pull origin main
```

### Paso 2: Verificar cambios pendientes

Antes de publicar, asegurate de que todos los cambios que quieras incluir estén mergeados en main.

El workflow se dispara únicamente cuando se hace push de un tag `v*`. No se publica automáticamente al hacer merge de PRs.

### Paso 3: Crear la nueva versión

```bash
npm version patch      # Para patch (0.0.1 -> 0.0.2)
# O
npm version minor     # Para minor (0.1.0 -> 0.2.0)
# O
npm version major     # Para major (1.0.0 -> 2.0.0)
```

Este comando:
- Actualiza automáticamente la versión en `package.json`
- Crea un tag git (ej: `v0.3.14`)

### Paso 4: Push del código y tag

```bash
git push                    # Sube los cambios del package.json
git push --tags            # Sube el tag y dispara el workflow
```

### Paso 5: Verificar la publicación

1. Ir a [GitHub Actions](https://github.com/sepulvedamarcos/jobtracker/actions)
2. Verificar que el workflow "Release" corrió exitosamente
3. Verificar en [npm](https://www.npmjs.com/package/jobtracker) que la nueva versión aparece

## Workflow Automático

Cuando se hace push de un tag `v*`, el workflow hace automáticamente:

1. Checkout del código
2. Setup de Node.js 24
3. Actualizar npm a 11.6.2 (requerido para OIDC)
4. Instalar dependencias (`npm ci`)
5. Build del proyecto (`npm run build`)
6. Publicar a npm con provenance (OIDC - sin tokens)
7. Crear GitHub Release automáticamente

## Solución de Problemas

### Error: "Cannot read properties of undefined"
Si el build falla con errores de TypeScript, verificá que el código compile localmente:
```bash
npm run build
```

### Error: "E404 Not Found" en npm publish
- Verificar que el Trusted Publisher esté configurado en npmjs.com
- Verificar que el `repository.url` en package.json coincida con el repositorio de GitHub (minúsculas)

### Error: "You cannot publish over the previously published versions"
El tag está desincronizado con la versión del package.json. El tag debe coincidir con la versión en package.json.

Solución:
1. Verificar versión actual: `cat package.json | grep '"version"'`
2. Verificar tags existentes: `git tag -l`
3. Ajustar manualmente si es necesario

## Configuración Técnica

### Runtime
- Node.js 24 (requerido para npm 11.5.1+)
- npm 11.6.2

### Permisos del Workflow
```yaml
permissions:
  contents: write    # Para crear releases
  id-token: write    # Para OIDC
```

### Trigger
```yaml
on:
  push:
    tags:
      - 'v*'
```

## Notas Importantes

1. **No se necesitan tokens**: El sistema usa OIDC (Trusted Publishing) - no requiere NPM_TOKEN ni ningún secret.

2. **Solo se dispara con tags**: El push a main sin tag no dispara publicación.

3. **Un tag = una publicación**: Cada tag dispara una publicación. Consolidá múltiples cambios en un solo tag.

4. **Provenance**: La publicación incluye automáticamente firmas criptográficas que verifican la procedencia del código.

## Enlaces Útiles

- [Paquete en npm](https://www.npmjs.com/package/jobtracker)
- [Releases en GitHub](https://github.com/sepulvedamarcos/jobtracker/releases)
- [Workflow Actions](https://github.com/sepulvedamarcos/jobtracker/actions)
- [Configuración del paquete](https://www.npmjs.com/package/jobtracker/settings)