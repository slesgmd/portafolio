# Instrucciones para asistentes de código

Reglas para asistentes de código en este repositorio. La fuente de verdad es `docs/PLAN.md`; las decisiones están en `docs/adr/`.

## Al empezar cada sesión

1. Leer `docs/PROGRESO.md` y la sección del plan de la tarea actual.
2. Resumir dónde estamos y el siguiente paso, y presentar un plan breve de la tarea.
3. Esperar el ok antes de modificar archivos.
4. Al cerrar, actualizar `docs/PROGRESO.md`: estado, siguiente paso, tarea cerrada con su commit y sus horas, decisiones y pendientes.

## Reglas

- Respetar las fronteras entre capas y los paquetes externos permitidos por capa (PLAN §5.2).
- Ninguna dependencia nueva sin ADR (principio 6). Toda dependencia respeta la edad mínima de 7 días (`minimumReleaseAge`).
- Ninguna petición a terceros: todo recurso se sirve desde el propio origen (principio 1).
- Ningún atributo `style=` ni script inline sin hash (§7).
- Ningún `define:vars` (§7, §10).
- Ningún worker creado desde URL `blob:` o `data:` (§5.8).
- Ninguna dependencia que use el DOM dentro de un worker (§5.8; §17, riesgo 15).
- Toda prueba debe ser determinista.
- Nunca incluir atribución, coautoría ni enlaces de sesión en commits, etiquetas ni pull requests.
- No nombrar al asistente de código ni a su proveedor en ningún archivo versionado, nombre de archivo, commit, etiqueta ni pull request. Los archivos de configuración propios de cada asistente son locales y no se versionan.
- Nada de Ontos que no sea ya público, y nunca su código (principio 8).

## Convenciones

- Commits en Conventional Commits, con el tipo en inglés y la descripción en español. Ramas `tipo/descripcion-corta`.
- Saltos de línea LF y UTF-8 (`.gitattributes`, `.editorconfig`).
- Gestor de paquetes: pnpm, en la versión de `packageManager`. Node 24 LTS (`.nvmrc`).
- Cada ADR se escribe en la tarea donde se toma su decisión (PLAN §15).
