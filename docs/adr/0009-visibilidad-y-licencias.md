# ADR 0009: Visibilidad del repositorio y licencias

- **Estado:** aceptado
- **Fecha:** 18/10/2026
- **Tarea:** 0.1

## Contexto

El repositorio contiene dos tipos de material con necesidades distintas: el código del sitio y de las herramientas, y el contenido editorial (textos e imágenes de las páginas). El código de las herramientas no es sensible, y el código de Ontos nunca entra en este repositorio (principio 8). La visibilidad afecta también al coste de CI (§16, decisión 1).

## Opciones consideradas

**Visibilidad**

1. **Público:** GitHub Actions no cobra minutos en runners estándar para repositorios públicos, así que las E2E pueden correr en los tres motores en cada PR. El repositorio sirve además como muestra de trabajo.
2. **Privado:** limita los minutos de CI; las E2E correrían en un solo motor por PR y en los tres al fusionar.

**Licencias**

1. **MIT para el código y todos los derechos reservados para el contenido.**
2. **MIT para todo:** permitiría reutilizar los textos personales sin permiso.
3. **Sin licencia:** el código no podría reutilizarse legalmente, y la intención quedaría ambigua.

## Decisión

- Repositorio **público** en GitHub.
- **Código:** licencia MIT (`LICENSE`), titular Sebastián Lescano.
- **Contenido:** todos los derechos reservados (`LICENSE-CONTENT`, en español e inglés). Cubre los textos, las imágenes y el resto del material editorial, como las páginas de inicio y "sobre mí" y sus traducciones.
- Los **textos de interfaz** de las herramientas (etiquetas, mensajes y ayudas) forman parte del código y quedan bajo MIT.

## Consecuencias

- Todo lo que se publique en el repositorio es visible: los principios 8 y 9 y la prohibición de secretos en el código (§7) se aplican sin excepciones.
- Las E2E pueden correr en los tres motores en cada PR sin coste (§12).
- La frontera entre contenido y textos de interfaz se revisa en la tarea 0.8, cuando exista el contenido. Si algún archivo mezcla ambos, se separa o se indica su licencia en el propio archivo.
