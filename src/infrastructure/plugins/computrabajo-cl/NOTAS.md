# Plugin Computrabajo.cl - Limitaciones y Notas

## Cómo funciona la búsqueda

computrabajo.cl usa búsqueda por **palabra exacta** (case-insensitive).

## Limitaciones conocidas

### 1. Protección anti-bot

computrabajo.cl tiene protección que puede devolver **403 Forbidden**.

**Mitigaciones implementadas:**
- User agents realistas
- Headers HTTP completos
- Rotación de user agent
- Manejo de errores con reintento de URL alternativa

### 2. Mapeo de keywords

Algunos términos requieren mapeo:

| Keyword | Se convierte a | Motivo |
|---------|----------------|--------|
| `node.js` | `javascript` | El sitio no reconoce `node` |
| `.net` | `dotnet` | El sitio no reconoce `.net` |
| `c#` | `csharp` | El sitio no reconoce `c#` |

### 3. Resultados limitados

El sitio puede tener menos resultados que otros portales para ciertas keywords.

## Comportamiento esperado

| Keyword | Resultados esperados | Notas |
|---------|---------------------|-------|
| `python` | 10-20 | Volumen medio |
| `javascript` | 15-25 | Buen volumen |
| `java` | 20-30 | Buen volumen |
| `react` | 10-15 | Volumen medio |

## URL patterns probados

```
https://www.computrabajo.cl/trabajo/{keyword}
https://www.computrabajo.cl/trabajo?q={keyword}
```

## Troubleshooting

### Error 403 Forbidden
- El sitio tiene protección anti-bot
- El plugin intenta con user agents alternativos
- Puede requerir esperar entre requests

### Pocos resultados
- Verificar que la keyword es reconocida por el sitio
- Intentar con variaciones (ej: "javascript" vs "js")

### Timeout
- Aumentar waitForTimeout si el sitio es lento
- Verificar conexión a internet

## Ejemplo de uso

```bash
# Probar plugin
npx tsx plugin-sdk/scripts/test.ts --name computrabajo-cl --keywords "python,javascript"

# Validar estructura
npx tsx plugin-sdk/scripts/validate.ts --name computrabajo-cl

# Compilar
npx tsx plugin-sdk/scripts/build.ts --name computrabajo-cl
```