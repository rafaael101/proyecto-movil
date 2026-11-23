# Bitácora de IA — HoopsMap

> **Autor:** Rafael García · **Materia:** Aplicaciones Móviles · **Última actualización:** 2026-11-22
> Las decisiones de diseño y su porqué están en [`diario-decisiones.md`](diario-decisiones.md). Aquí se registra **cómo** usé la IA, en qué se equivocó y cómo lo revisé.

---

## 1. Herramientas

| Herramienta | Para qué la usé |
|---|---|
| **Claude (chat)**, en un Proyecto de claude.ai con las instrucciones fijas del curso | Escribir y corregir las specs (`specs/`), `docs/coding-standards.md` y `CLAUDE.md`. Un chat = un documento. En estos chats no se escribió código |
| **Claude Code** | Implementar el código task por task, a partir de las specs. Lee `CLAUDE.md` al iniciar cada sesión |

No usé otras herramientas de IA.

---

## 2. Cómo trabajé con la IA (Spec-Driven Development)

1. **Spec primero.** En el chat escribí cada spec con la plantilla de la guía SDD del profesor: objetivo, flujo, validaciones, casos de error, criterios de aceptación verificables y tasks pequeñas. Antes de aceptar una spec, la leí y pedí cambios cuando algo no cuadraba con las clases o con otra spec.
2. **Código después.** A Claude Code le pedía una task o un bloque de tasks (por ejemplo, `F03.1` a `F03.3`). Él leía la spec, implementaba, corría `npx tsc --noEmit`, `npx expo lint` y `npx jest`, marcaba la task y hacía **un commit local por task**.
3. **Revisión mía.** Antes de subir, revisaba cada commit con `git log`, `git diff` y `git diff --staged --stat`. Después probaba en el iPhone con Expo Go los pasos que me daba Claude Code, incluidos los casos negativos: modo avión, permisos negados y listas vacías.
4. **Criterios de aceptación.** Las tasks las marcaba Claude Code. Los criterios (CAxx, CADxx) los marqué yo, solo después de probarlos en el iPhone, en Jest o en el Rules Playground de Firebase.
5. **Push.** Siempre lo hice yo. Claude Code tiene prohibido hacer `push` (`CLAUDE.md`).

### Reglas que le puse a la IA (`CLAUDE.md`)

- No implementar nada sin spec ni agregar cosas que la spec no pide; si algo es ambiguo, **preguntar**.
- No instalar paquetes sin preguntar, y siempre con `npx expo install`.
- No "arreglar" errores apagando la revisión (`any`, `@ts-ignore`, `eslint-disable`).
- Ningún componente ni pantalla de más de ~150 líneas; si pasa, detenerse y proponer cómo dividirlo.
- Explicarme cada task en lenguaje sencillo y darme pasos exactos para probarla en el iPhone.
- Nunca escribir datos del `.env` (coordenadas, llaves) en código, specs ni commits.

Estas reglas fueron cambiando cuando algo no funcionaba (ver sección 4).

---

## 3. Cronología

| Fechas | Qué hice con la IA |
|---|---|
| 2 nov | Primeras versiones de `00-project`, `01-navigation`, `02-data-model` y `coding-standards` en el chat |
| 5 nov | Spec de F01, excepciones de nombres, ESLint, SDK 58, dependencias de navegación (N1). Cambié `AGENTS.md` por `CLAUDE.md` |
| 8–12 nov | Navegación base (N2–N7), Prettier, `.env.example`, Firebase con la sesión en AsyncStorage (D1–D3) |
| 18–19 nov | Tasks del modelo de datos (02-data-model) e implementación de F01 con sus tests |
| 20 nov | Specs de F02, F05 y F06; implementación de F05; `expo-updates` y primera publicación con EAS Update |
| 21 nov | Specs de F03, F04 y F07; implementación de F02, F03, F04 y F06 |
| 22 nov | F07, cierre de 02-data-model (D17, D18), cancha de demostración, ajustes finales y esta bitácora |

---

## 4. Errores de la IA y cómo me di cuenta

Todos se pueden ver en el historial de Git.

| # | Qué estaba mal | Cómo me di cuenta | Cómo se corrigió |
|---|---|---|---|
| 1 | La spec de F07 (escrita en el chat) tipaba el ref de la tarjeta como `RefObject<View>`. En React Native 0.88, `View` es una función y no sirve como tipo del ref | `npx tsc --noEmit` falló al implementar F07.8; Claude Code se detuvo y lo explicó | Se usó `HostInstance` y se corrigió la spec (`638448a`). También hizo falta `collapsable={false}` en el `View` para que `captureRef` lo encontrara |
| 2 | El estándar decía que en Testing Library solo `render` era asíncrono. Desde la v14, `fireEvent` también lo es: la IA tenía información vieja | Al escribir los tests de integración con la versión instalada (v14) | Se aclaró en `coding-standards` §12 (`908e38f`) |
| 3 | Las specs se contradecían sobre **qué feature limpia el store de check-ins** al cerrar sesión (F02, F03 o F06), porque las tasks se movieron de una feature a otra | Al implementar F06, la referencia apuntaba a una feature que todavía no existía | Se corrigieron F01 y F06 (`0195f83`, `d2c8d95`, `afa5beb`) |
| 4 | F01-CA28 decía que solo `servicioSesion.ts` importa `firebase/auth`, pero `firebase.ts` también lo necesita para iniciar la sesión con AsyncStorage | Al revisar el criterio contra el código | Se corrigió el criterio (`14af16a`) |
| 5 | La spec decía que los iconos de `@expo/vector-icons` "ya vienen con Expo"; con la plantilla `blank-typescript` hay que instalarlos | Al instalar las dependencias de navegación (N1) | Se corrigió 01-navigation (`a8df3f2`) |
| 6 | `FormularioPartido` pasó de las ~150 líneas que pide el estándar | Revisando el tamaño de los archivos | Se separó `CamposPartido` (F05.9, `30ccad2`) y agregué a `CLAUDE.md` la regla de revisar las líneas antes de cada commit (`cb70278`) |
| 7 | Después de F02, el test de integración de F05 dejó de pasar: Mapa es la tab inicial y llamaba a un servicio que no estaba simulado | `npx jest` falló | Se simuló `servicioCheckIns` en ese test y se aclaró en la spec de F05 (`8670f88`, `32684a7`) |
| 8 | El criterio CAD29 no contemplaba `useNetInfo`, que sí está permitido en las pantallas (excepción 3 de §4) | Al revisar CAD28–CAD30 en D17 | Se ajustó CAD29 (`e43b2d3`) |

---

## 5. Lo que ajusté o no acepté

- **Forma de hacer commits.** Al principio Claude Code solo proponía el mensaje y yo hacía cada commit. Era lento, así que lo cambié: Claude Code hace un commit local por task y yo reviso y subo (`coding-standards` v2.3, §17 y §18; `CLAUDE.md`).
- **Cambios pequeños de nombres y de diseño** que la IA proponía y que no pedían las specs: no los acepté, porque la regla del proyecto es cumplir la rúbrica en su mínimo, sin extras.
- **Excepciones de tamaño.** En lugar de seguir dividiendo archivos, acepté cuatro que quedan arriba de ~150 líneas, con su motivo (ver diario).
- **Diferencias con lo que dice la spec** que acepté porque se ven igual o funcionan mejor: el `gap` entre `TarjetaAfluencia` y `PanelCheckIn`, y el botón "Abrir Ajustes" deshabilitado mientras la pantalla trabaja (ver diario).
- **Lo que la IA no decide:** las decisiones de alcance (qué entra al MVP, qué se deja fuera, cómo se entrega) las tomé yo. La IA solo daba opciones; cuando le pedía recomendación, debía recomendar la más simple de explicar.

---

## 6. Cómo verifiqué lo que hizo la IA

- **Automático:** `npx tsc --noEmit`, `npx expo lint` y `npx jest` antes de cada commit. Al cierre pasan 15 suites con 87 tests (12 criterios unitarios de 02-data-model y 4 pruebas de integración).
- **En el teléfono:** cada criterio de aceptación se probó en el iPhone con Expo Go antes de marcarlo, incluidos los casos negativos.
- **En Firebase:** las reglas de Firestore se probaron en el Rules Playground (CAD01–CAD05).
- **En Git:** revisé cada commit antes de subirlo. Dos commits (`40a4791` y `5f18a69`) quedaron con mensajes que no describen todo su cambio; no se reescribieron porque ya estaban en GitHub (ver diario).

---

## 7. Lo que aprendí usando IA

- La IA escribe rápido, pero **una spec con un error produce código con el mismo error**. Los errores más comunes fueron contradicciones entre specs y datos viejos de versiones de librerías (React Native 0.88, Testing Library v14).
- Correr TypeScript, ESLint y Jest después de cada task atrapó la mayoría de los errores antes de llegar al teléfono.
- Darle reglas por escrito (`CLAUDE.md`) funcionó mejor que repetirlas en cada mensaje.
