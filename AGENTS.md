# Instrucciones para asistentes de código

Reglas para asistentes de código en este repositorio. La fuente de verdad es `docs/PLAN.md`; las decisiones están en `docs/adr/`.

## Protocolo de trabajo por bloques

El trabajo se organiza en bloques de varias tareas. Los bloques de la F0a están en `docs/PROGRESO.md`.

1. Al empezar cada sesión, leer `docs/PROGRESO.md` y las secciones del plan de las tareas del bloque actual.
2. Dentro de un bloque no se pide ok por tarea. Cada tarea va en su rama y con su PR, y se fusiona con squash cuando la CI está en verde. Después se sigue con la siguiente.
3. Solo se detiene el trabajo para acciones en las cuentas del usuario (GitHub, Cloudflare, Renovate), decisiones irreversibles o algo que contradiga el plan. Para lo demás se elige la opción más conservadora coherente con el plan, y se anota en `docs/PROGRESO.md` como "decidido sin consultar".
4. Al cerrar cada tarea, y antes de seguir, actualizar `docs/PROGRESO.md`: estado, siguiente paso, tarea cerrada con su commit y sus horas, decisiones y pendientes. Así una compactación o un reinicio del contexto no pierden nada.
5. Al terminar el bloque, entregar un resumen con lo hecho, lo decidido sin consultar y las horas pendientes, y terminar con la línea "Listo para /clear".

## Reglas

- Respetar las fronteras entre capas y los paquetes externos permitidos por capa (PLAN §5.2).
- Ninguna dependencia nueva sin ADR (principio 6). Toda dependencia respeta la edad mínima de 7 días (`minimumReleaseAge`).
- Ninguna petición a terceros: todo recurso se sirve desde el propio origen (principio 1).
- Ningún atributo `style=` ni script inline sin hash (§7).
- Ningún `define:vars` (§7, §10).
- Ningún worker creado desde URL `blob:` o `data:` (§5.8).
- Ninguna dependencia que use el DOM dentro de un worker (§5.8; §17, riesgo 15).
- Toda prueba debe ser determinista.
- Nunca usar `--no-verify` ni saltarse los hooks de `.githooks/` de ninguna otra forma, tampoco en commits temporales o de prueba.
- Nunca incluir atribución, coautoría ni enlaces de sesión en commits, etiquetas ni pull requests.
- No nombrar al asistente de código ni a su proveedor en ningún archivo versionado, nombre de archivo, commit, etiqueta ni pull request. Los archivos de configuración propios de cada asistente son locales y no se versionan.
- Nada de Ontos que no sea ya público, y nunca su código (principio 8).

## Estilo del código y la documentación

- Comentarios solo para un porqué que el código no muestra: una decisión, una restricción o una referencia (§, ADR). Nada de comentarios que repitan lo que hace el código.
- Tono sobrio y directo, como el de un desarrollador que escribe para sí mismo: sin frases de relleno, sin emojis, sin encabezados decorativos, sin "Este archivo…" ni "Esta función…" y sin resúmenes al final.
- Nombres claros en lugar de comentarios explicativos.
- JSDoc solo en las API públicas de `core/` y `registry/`, y breve.

## Convenciones

- Commits en Conventional Commits, con el tipo en inglés y la descripción en español. Ramas `tipo/descripcion-corta`.
- Saltos de línea LF y UTF-8 (`.gitattributes`, `.editorconfig`).
- Gestor de paquetes: pnpm, en la versión de `packageManager`. Node 24 LTS (`.nvmrc`).
- Cada ADR se escribe en la tarea donde se toma su decisión (PLAN §15).
