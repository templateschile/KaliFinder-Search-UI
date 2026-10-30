# PM Agents — comunicación y entrega obligatoria para este repositorio

> Directriz permanente del dueño, 2026-10-30. PM Agents (ChatGPT/OpenAI) es el ÚNICO PM/Portfolio Manager para la cartera. Repo coordinador actual: `templateschile/ai-engineering-os` (NO asumir nombre `pm-agents` ya migrado). El Claude de este proyecto es EJECUTOR. OlaDigital (`templateschile/oladigital`) es agencia de marketing transversal.

## Al INICIAR cada sesión de Claude Code
1. Leer las instrucciones propias del proyecto (`CLAUDE.md`, etc.), esta regla y los Issues/PR pendientes del propio repositorio; priorizar Issues con `[PM Agents]` y encargos del PM central vinculados al proyecto. Comprobar repositorio, rama, estado real y dependencias antes de modificar archivos.
2. Si hay un encargo nuevo o materialmente actualizado, **contestar su Issue con un ACK REAL**, resumen de alcance, responsable/sesión, siguiente acción y bloqueo o ETA verificable. Si no hay novedades, no duplicar comentarios de estado.
3. No pedir al dueño que redacte tickets ni descomponga el trabajo: PM Agents investiga y decide arquitectura/requisitos operativos no irreversibles. Claude de proyecto implementa mediante Issue y PR; solo escalar decisiones que requieran autorización, acceso o impliquen riesgo material.

## Durante la ejecución
4. Registrar solo avances materiales en el Issue y, si corresponde, enlazar PR draft, pruebas, hallazgos de QA independiente, riesgos, costo y fecha. Si depende de otro proyecto, informar al Issue central y enlazar el Issue de origen.
5. Toda solicitud de marketing de este proyecto se enruta a OlaDigital, por **dos Issues enlazadas** (origen y OlaDigital). Nada se publica, envía o gasta sin aprobación comercial.
6. Datos operativos de clientes, pedidos, mensajes, proveedores y pagos NO se publican como GitHub Issues individuales ni en comentarios. Usar DB/dashboard privados; solo crear incidentes técnicos agrupados con métricas sanitizadas y deduplicadas.

## Definición obligatoria de terminado
7. Antes de dar por terminado un cambio versionable: revisar diff contra secretos/PII, ejecutar tests y QA pertinentes, hacer `git commit` descriptivo en rama de trabajo **y `git push` al remoto GitHub correcto**. Anotar SHA remoto y enlace al commit, rama, Issue, QA_STATUS, Evidence_URL y estado real de despliegue. PR en borrador si requiere revisión.
8. Si fue análisis sin archivos versionables: contestar `SIN CAMBIOS VERSIONABLES` con evidencia, SIN commit vacío. Si el push/CI/QA falla, usar `BLOQUEADO` o `EN REVISIÓN`, nunca `DONE`. No confundir un commit o merge con despliegue, publicación, ejecución de workflows o monitor activo.
9. Sin autorización y gates de QA/seguridad/rollback, no hacer merge, producción, migraciones de base de datos, borrados, gastos, campañas, emisiones, mensajes automáticos ni cambios de secretos. Skills y plugins de terceros deben pasar análisis de procedencia, permisos, licencia y SkillSpector cuando esté realmente instalado; no asumirlo instalado.

## Comunicación con PM Agents
10. Mantener como fuente única los Issues/PR y sus enlaces. PM Agents revisa GitHub y el portafolio; Claude reporta allí lo ejecutado. **Un Issue o commit NO enciende automáticamente Claude local**: si no hay sesión/runner autenticado y probado, indicar `EJECUTOR NO ACTIVO` o `ACK PENDIENTE`. Nunca simular respuestas de Claude desde una automatización de GitHub.
11. Entrega final en formato corto: `Issue | Estado | Rama | Commit SHA/URL | PR | Tests/QA_STATUS | Evidence_URL | Despliegue real | Riesgo/decisión`.

Referencias PM: https://github.com/templateschile/ai-engineering-os/issues/40 (tablero), https://github.com/templateschile/ai-engineering-os/issues/43 (gates). Compararepuestos: https://github.com/templateschile/ai-engineering-os/issues/54 (cartera), https://github.com/templateschile/repuestos-whatsapp/issues/7 (monitor).