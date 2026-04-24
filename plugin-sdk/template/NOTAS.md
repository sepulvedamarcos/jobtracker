# Plugin [NOMBRE] - Limitaciones y Notas

## Cómo funciona la búsqueda

Describe cómo funciona la búsqueda en este portal.

## Limitaciones conocidas

- [ ] Agregar limitaciones específicas del portal
- [ ] Ejemplo: no filtra por ubicación
- [ ] Ejemplo: máximo 50 resultados

## Configuración de keywords recomendada

```json
["python", "javascript", "react"]
```

## Comportamiento esperado por keyword

| Keyword | Resultados esperados | Notas |
|---------|---------------------|-------|
| `python` | 10-20 | Volumen típico |
| `react` | 15-25 | Buen volumen |

## Notas técnicas

Describe cualquier peculiaridad técnica del sitio:
- ¿Usa lazy loading?
- ¿Tiene paginación?
- ¿Requiere autenticación?
- ¿Tiene protección anti-bot?

## Ejemplo de uso

```bash
# Ejecutar desde JobTracker
npm run dev:plugin -- --find

# O probar directamente con el plugin
cd src/infrastructure/plugins/mi-plugin
npx tsx ../../../../plugin-sdk/scripts/test.ts --plugin mi-plugin
```