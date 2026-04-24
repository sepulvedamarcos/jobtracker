# Arquitectura de Use Cases - JobTracker

> Este documento describe la estructura de use cases para mantener la lógica de negocio separada de la UI.

---

## Estructura

```
src/core/use-cases/
├── keywords/           → Gestión de keywords
├── jobs/              → Avisos escaneados
├── applications/      → Postulaciones
└── plugins/           → Gestión de plugins
```

---

## Principio

Cada use case:
- **Hace una sola cosa** (SRP)
- **Retorna resultado**: `{ success: boolean, message: string, data?: T }`
- **Es independiente de UI**
- **Usa puertos (IJobRepository)**

---

## Keywords

| Use Case | Función |
|---------|---------|
| `AddKeywordUseCase` | Agregar nueva keyword |
| `DeleteKeywordUseCase` | Eliminar por índice |
| `ListKeywordsUseCase` | Listar todas |

```typescript
import { addKeywordUseCase, deleteKeywordUseCase, listKeywordsUseCase } 
  from './core/use-cases/keywords';

// Usar
const result = await addKeywordUseCase('node.js');
if (result.success) {
  console.log(result.message); // "Keyword 'node.js' agregada."
}
```

---

## Jobs

| Use Case | Función |
|---------|---------|
| `GetScannedJobsUseCase` | Obtener avisos guardados |
| `SaveScannedJobsUseCase` | Guardar avisos del scan |

```typescript
import { getScannedJobsUseCase, saveScannedJobsUseCase } 
  from './core/use-cases/jobs';

const { jobs } = await getScannedJobsUseCase();
await saveScannedJobsUseCase(newJobs);
```

---

## Applications

| Use Case | Función |
|---------|---------|
| `ApplyToJobUseCase` | Postular a un aviso |
| `UpdateApplicationStatusUseCase` | Cambiar estado |
| `ListApplicationsUseCase` | Listar postulaciones |

```typescript
import { applyToJobUseCase, listApplicationsUseCase } 
  from './core/use-cases/applications';

const result = await applyToJobUseCase(job, 'notas opcionales');
```

---

## Plugins

| Use Case | Función |
|---------|---------|
| `InstallPluginUseCase` | Instalar .scrapper |
| `RunPluginsScanUseCase` | Ejecutar scan |

```typescript
import { installPlugin, runPluginsScan } from './core/use-cases/plugins';

const result = await installPlugin('/path/to/plugin.scrapper');
const jobs = await runPluginsScan(['trabajando-cl'], console.log);
```

---

## Cómo Consumir desde UI

```typescript
// MainLayout.tsx
import { addKeywordUseCase, listKeywordsUseCase } from '../../core/use-cases/keywords';

const handleAdd = async () => {
  const result = await addKeywordUseCase('angular');
  
  if (result.success) {
    const list = await listKeywordsUseCase();
    setKeywords(list.keywords);
  }
  
  setStatus(result.message);
};
```

---

## NO hacer

```typescript
// ❌ MAL - Acoplado a servicio interno
await addKeyword(nextKeyword);

// ✅ BIEN - Use case con resultado estructurado
const result = await addKeywordUseCase(nextKeyword);
```

---

## Puerto (Repository)

Los use cases usan la interfaz, no la implementación:

```typescript
import { IJobRepository } from '../../ports/IJobRepository';

export const getScannedJobsUseCase = async () => {
  const repo: IJobRepository = new JsonJobRepository();
  return repo.getLastScannedJobs();
};
```

Esto permite cambiar el storage sin modificar use cases.