# Plugin Trabajando.cl - Limitaciones y Notas

## Cómo funciona la búsqueda

trabajando.cl usa búsqueda por **palabra exacta** (case-insensitive).

```
✅ django    → busca "django" exactamente
✅ angular   → busca "angular" exactamente
✅ oracle    → busca "oracle" exactamente
✅ python     → busca "python" exactamente
```

## Limitaciones conocidas

### 1. Puntos NO funcionan (pero se reemplazan)

| Keyword | Resultado | Motivo |
|---------|-----------|--------|
| `node.js` | ❌ → se convierte a `nodejs` | El `.` no es válido |
| `Csharp` | ❌ | Debe ser `csharp` sin mayúscula |

**El scraper automáticamente reemplaza puntos conocidos:**
- `.js` → `js` (node.js → nodejs)
- `.net` → `net` (.net → net)
- `.ts` → `ts`
- `.py` → `py`

### 2. Espacios SÍ funcionan con %20

| Keyword | Resultado | Notas |
|---------|-----------|-------|
| `sql server` | ✅ 62 empleos | Se convierte a `sql%20server` |
| `.net core` | ✅ funciona | Se convierte a `net%20core` |

### 3. Mayúsculas: funciona case-insensitive

`python`, `Python`, `PYTHON` → todos funcionan igual.

### 4. Búsqueda es exacta

No hay búsqueda inteligente. Ver tabla de mapeo abajo.

## Comportamiento esperado por keyword

| Keyword | Resultados esperados | Notas |
|---------|---------------------|-------|
| django | 2-5 | Pocas ofertas |
| python | 10-20 | Buen volumen |
| javascript | 15-25 | Buen volumen |
| angular | 7-15 | Volumen medio |
| oracle | 20-40 | Necesita cargar más |
| csharp | 0 | No existe, usar `csharp` sin mayúscula |
| nodejs | 10-20 | Sin el punto |

## Configuración de keywords recomendada

Para maximizar resultados, usar las keywords correctas:

```json
["python", "javascript", "angular", "react", "java", "django", "flask", "oracle", "postgresql", "mysql", "docker", "kubernetes", "aws", "azure", "nodejs", "golang", "rust", "csharp", "sql server", "tableau", "powerbi"]
```

**Reemplazos automáticos del scraper:**
- `node.js` → `nodejs`
- `.net` → `net`
- `.net core` → `net%20core` (URL-encoded)
- `sql server` → `sql%20server` (URL-encoded)

**No necesita ajuste manual:**
- `python` → ✅ funciona directo
- `angular` → ✅ funciona directo
- `oracle` → ✅ funciona directo
- `docker` → ✅ funciona directo