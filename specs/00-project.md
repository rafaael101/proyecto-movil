# Proyecto final — HoopsMap
 
> **Estado:** v1.0 (pendientes solo las preguntas para el profesor) · **Última actualización:** 2026-11-02
> **Materia:** Aplicaciones Móviles · **Metodología:** Spec-Driven Development (SDD)
> **Equipo:** individual. La rúbrica del curso está pensada para equipos de 3; aquí se cumple **cada requisito obligatorio en su mínimo**, sin extras.
> **Entrega final:** últimos días de noviembre de 2026
> **Dispositivo de pruebas:** iPhone con Expo Go
 
---
 
## Nombre
 
**HoopsMap**
 
---
 
## Problema
 
Los jugadores recreativos de básquetbol que quieren jugar retas en canchas públicas o universitarias (por ejemplo, la Unidad Deportiva Sullivan o las canchas de la universidad) **no tienen forma de saber, antes de salir de casa, si habrá gente jugando**. Con frecuencia invierten tiempo en trasladarse y encuentran la cancha vacía o sin gente suficiente para armar equipos.
 
Además, los jugadores **no tienen una forma sencilla de registrar cómo les fue** en cada reta, por lo que no pueden ver su progreso con el tiempo.
 
---
 
## Usuario objetivo
 
**Usuario principal:** jugador recreativo de básquetbol (aprox. 16–30 años) que juega retas en canchas públicas o universitarias de su ciudad, tiene smartphone y decide ir a jugar "sobre la marcha", sin partidos agendados.
 
**Fuera del alcance (no diseñamos para ellos en el MVP):** ligas organizadas, árbitros, entrenadores, administradores de canchas.
 
---
 
## Propuesta de solución
 
Una app móvil con dos módulos:
 
1. **Afluencia (mapa):** el usuario ve las canchas cercanas en un mapa y cuánta gente está buscando jugar en cada una en este momento. Cuando llega a una cancha hace *check-in*; ese check-in cuenta durante un tiempo limitado y después desaparece, para que el mapa siempre refleje la actividad real.
2. **Bitácora (rendimiento):** al terminar una reta, el usuario registra sus estadísticas. Puede consultar, editar y borrar sus partidos, ver su historial (también sin conexión) y sus promedios, y generar una **tarjeta de jugador** con una foto tomada con la cámara para compartirla en redes sociales.
---
 
## MVP
 
| ID  | Feature                                         | Módulo     | Prioridad   | Spec |
|-----|-------------------------------------------------|------------|-------------|------|
| F01 | Registro, inicio y cierre de sesión             | Cuenta     | Alta        | pendiente |
| F02 | Mapa de canchas cercanas                        | Afluencia  | Alta        | pendiente |
| F03 | Hacer y terminar check-in en cancha             | Afluencia  | **Central** | pendiente |
| F04 | Detalle de cancha y su afluencia                | Afluencia  | Alta        | pendiente |
| F05 | Registrar, editar y eliminar partido (CRUD)     | Bitácora   | Alta        | pendiente |
| F06 | Historial paginado, promedios y caché offline   | Bitácora   | Alta        | pendiente |
| F07 | Tarjeta de jugador (foto + compartir)           | Social     | Media       | pendiente |
 
**Por qué F03 es la central:** es la funcionalidad que resuelve el problema principal. Sin check-ins, el mapa no aporta nada nuevo frente a Google Maps.
 
**Si falta tiempo:** F04 puede ser una pantalla sencilla (nombre, nivel de afluencia y botón de check-in). Ninguna otra feature se puede recortar sin perder puntos de la rúbrica.
 
---
 
## Reglas de negocio
 
- **RN01 — Duración del check-in:** un check-in cuenta durante **90 minutos** desde que se crea. Después deja de contar automáticamente.
- **RN02 — Cercanía:** solo se puede hacer check-in si el GPS indica que el usuario está a **150 m o menos** de la cancha. Evita check-ins falsos desde casa.
- **RN03 — Un check-in a la vez:** un usuario solo puede tener un check-in activo. Hacer check-in en otra cancha termina el anterior.
- **RN04 — Salida manual:** el usuario puede terminar su check-in antes de tiempo ("Ya me voy").
- **RN05 — Catálogo de canchas fijo en la app:** las canchas (nombre y coordenadas) están escritas en el código (`src/constants/courts.ts`). No se guardan en el backend y los usuarios no crean canchas. Así funcionan sin conexión y no hace falta administrarlas.
  | ID (`courtId`)      | Nombre                                        | Latitud   | Longitud    |
  |---------------------|-----------------------------------------------|-----------|-------------|
  | `sullivan`          | Unidad Deportiva Juan A. Rodríguez Sullivan   | 31.856794 | -116.613772 |
  | `parque-morelos`    | Parque Morelos                                | 31.857799 | -116.593759 |
  | `siglo-xxi`         | Unidad Deportiva Siglo XXI                    | 31.850188 | -116.569762 |
  | `uabc-sauzal`       | UABC Sauzal — Canchas de básquetbol           | 31.864083 | -116.666502 |
  | `parque-hidalgo`    | Parque Hidalgo                                | 31.856977 | -116.587417 |
  | `gimnasio-municipal`| Gimnasio Municipal Óscar "Tigre" García       | 31.868311 | -116.613094 |
  | `parque-la-hoja`    | Parque De La Hoja                             | 31.881610 | -116.603568 |
  **Cancha de prueba (solo desarrollo):** para probar RN02 sin salir de casa se agrega una cancha extra cuyas coordenadas se leen del `.env` (`EXPO_PUBLIC_TEST_COURT_LAT`, `EXPO_PUBLIC_TEST_COURT_LNG`). Si esas variables no existen, la cancha no aparece. Sus coordenadas **nunca** se escriben en el código ni en las specs, porque el repositorio es público. Se elimina antes de la entrega.
- **RN06 — Privacidad:** la app muestra **solo el número** de jugadores por cancha, nunca quiénes son ni su ubicación.
- **RN07 — Niveles de afluencia** (pensados en básquet):
  | Jugadores activos | Nivel        | Significado                |
  |-------------------|--------------|----------------------------|
  | 0                 | Vacía        | No hay nadie               |
  | 1–5               | Poca gente   | Alcanza para un "21" o 2v2 |
  | 6–9               | Hay reta     | Alcanza para 3v3 o 4v4     |
  | 10 o más          | Llena        | 5v5 y probablemente espera |
- **RN08 — Estadísticas autorreportadas:** cada usuario captura las suyas; nadie más las valida.
- **RN09 — Datos de un partido:** fecha, cancha (opcional), resultado (ganó / perdió), puntos, rebotes y asistencias. Marcador final opcional.
- **RN10 — Solo el dueño modifica:** un usuario solo puede ver, editar y eliminar sus propios partidos.
- **RN11 — Historial sin conexión:** la última lista de partidos descargada se guarda en el teléfono (AsyncStorage) y se muestra sin internet, en modo solo lectura. Crear, editar, borrar partidos y hacer check-in requieren conexión.
---
 
## Cumplimiento de la rúbrica (en su mínimo)
 
| Requisito obligatorio | Cómo se cumple | Features |
|---|---|---|
| Autenticación | Registro, login, sesión persistente y cerrar sesión con Firebase Auth | F01 |
| Navegación (≥ 5 pantallas, Stack + Tabs + Modal) | **Stack:** Login, Registro, Detalle de cancha · **Tabs:** Mapa, Historial, Perfil · **Modal:** Partido (crear/editar), Tarjeta de jugador → 8 pantallas | Todas |
| CRUD completo | Entidad **Partido**: crear, leer (historial), editar y eliminar | F05, F06 |
| Persistencia local | AsyncStorage: sesión de Firebase y caché del historial (RN11) | F01, F06 |
| Backend (≥ 5 endpoints) | Firebase: crear check-in, terminar check-in, obtener check-ins activos, crear / listar / editar / eliminar partido (7), además de registro e inicio de sesión | F01, F03–F06 |
| Features nativas (≥ 2) | Geolocalización y mapas, cámara/galería, compartir contenido | F02, F03, F07 |
| State management | Zustand | Todas |
| Formularios validados (≥ 3) | Registro, inicio de sesión, partido (crear/editar) | F01, F05 |
| Listas optimizadas | FlatList del historial con *infinite scroll* (páginas de 10) | F06 |
| Testing (12 unitarios + 4 integración) | Unitarios en funciones puras (distancia, nivel de afluencia, promedios, validaciones); integración en pantallas con servicios simulados | Todas |
| TypeScript strict, modular, errores y carga, comentarios | Ver `docs/coding-standards.md` | Todas |
| Documentación | README, documento de arquitectura con diagrama, video demo de 3–5 min | Semana 4 |
| Presentación | Demo en vivo (10 min), explicación técnica (5 min), preguntas (5 min) | Semana 4 |
 
> **No se hacen extras** (modo oscuro, notificaciones, i18n, etc.) hasta que todo lo anterior esté terminado.
 
---
 
## Decisiones técnicas
 
| Tema               | Decisión                                         | Por qué |
|--------------------|--------------------------------------------------|---------|
| Framework          | React Native con Expo                            | Lo recomienda el curso |
| Lenguaje           | TypeScript en modo strict                        | Lo pide la rúbrica |
| Navegación         | **React Navigation** (Native Stack + Bottom Tabs), configurada a mano | Es lo que se enseña en clase (`NavigationContainer`, `RootStackParamList`); más fácil de defender. Por eso el proyecto se crea con la plantilla `blank-typescript`, no con la de Expo Router |
| Estado global      | Zustand                                          | El más sencillo de los tres que acepta la rúbrica |
| Backend            | Firebase (Auth + Firestore)                      | La rúbrica lo nombra; no requiere SQL; el SDK de JavaScript funciona en Expo Go |
| Persistencia local | AsyncStorage                                     | Lo pide la rúbrica |
| Mapa               | `react-native-maps` (en iPhone usa Apple Maps, sin llave de API) | Funciona en Expo Go |
| Ubicación          | `expo-location`                                  | Visto en clase |
| Cámara / foto      | `expo-image-picker` (cámara o galería)           | Visto en clase |
| Tarjeta            | `react-native-view-shot` + `expo-sharing`        | Convertir la tarjeta en imagen y compartirla |
| Formularios        | Validación manual + custom hook de formulario    | Es lo que se enseña en clase; las validaciones son funciones puras fáciles de probar |
| Testing            | Jest + `jest-expo` + React Native Testing Library | Estándar en Expo |
 
### Por qué se necesita un backend
 
El check-in solo tiene sentido si **otros usuarios lo ven**. Si los datos se guardan solo en el teléfono, cada persona vería únicamente sus propios check-ins y el módulo de afluencia no funcionaría. Los partidos también se guardan en Firebase, y AsyncStorage funciona como copia local para consultarlos sin conexión.
 
---
 
## Plan de trabajo
 
| Semana | Fechas | Specs | Implementación |
|---|---|---|---|
| 1 | 2–8 nov | `00-project`, `01-navigation`, `02-data-model`, F01, F02, F03 | Repo, proyecto Expo, Firebase, navegación base, F01 |
| 2 | 9–15 nov | F04, F05 | F02, F03, F04 + sus tests |
| 3 | 16–22 nov | F06, F07 | F05, F06 + sus tests |
| 4 | 23–fin nov | — | F07, tests faltantes, README, arquitectura, build con EAS, video y ensayo de la presentación |
 
- Los tests se escriben junto con cada feature, no al final.
- Ritmo de Git: commits pequeños con fecha real, uno por tarea de la spec. El profesor revisa el historial en la defensa.
---
 
## Riesgos y cómo mitigarlos
 
| Riesgo | Mitigación |
|--------|------------|
| **Poco tiempo para un proyecto pensado para 3 personas** | Cumplir cada requisito en su mínimo; nada extra hasta terminar el MVP. |
| **Mapa vacío** (nadie más usa la app todavía) | Mensaje "Sé el primero en hacer check-in". Para la demo, preparar 2–3 cuentas de prueba. |
| **No poder probar el check-in desde casa** (RN02) | Cancha de prueba configurada desde `.env` (ver RN05); se quita antes de entregar. |
| **Check-ins falsos** | RN02 (cercanía por GPS). |
| **Permiso de ubicación negado** | El mapa se muestra centrado en la ciudad, el botón de check-in se deshabilita y se explica cómo activarlo en Ajustes. |
| **Permiso de cámara negado** | Permitir elegir una foto de la galería o generar la tarjeta sin foto. |
| **Sin internet** | RN11: historial desde caché; mensajes de error claros. |
| **"Build exitoso con EAS" (checklist de entrega)** | No se publica en tiendas. Desarrollo y demo con Expo Go en iPhone. Si el profesor exige el build de EAS, se genera uno de Android (el de iOS requiere cuenta de Apple de pago). |
| **Sin Mac (laptop con Windows)** | No hay simulador de iOS; todo se prueba en el iPhone con Expo Go. |
 
---
 
## Funcionalidades futuras (fuera del MVP)
 
- Notificación cuando una cancha favorita empiece a tener actividad.
- Canchas favoritas.
- Que los usuarios propongan canchas nuevas.
- Estadísticas extendidas (robos, tapones, tiros) y gráficas de progreso.
- Ver qué amigos están en una cancha.
- Validación de estadísticas por otros jugadores.
- Crear y editar partidos sin conexión con sincronización posterior.
---
 
## Preguntas abiertas
 
1. **Para el profesor:** ¿se ajustan las cantidades mínimas (tests, formularios, pantallas) por ser proyecto individual?
2. **Para el profesor:** ¿es obligatorio el "build exitoso con EAS" o basta con correr la app en Expo Go?
### Resueltas
 
- **Nombre:** HoopsMap.
- **Canchas:** 7 canchas del catálogo (RN05) + cancha de prueba por `.env`.
- **Entorno:** laptop con Windows + iPhone con Expo Go; proyecto creado con la plantilla `blank-typescript`.
- **Navegación:** React Navigation, como en clase.
- **Backend:** Firebase.
- **Equipo:** individual; la rúbrica se usa como referencia y se cumple en su mínimo.
- **Duración del check-in:** 90 min fijos (RN01).
- **¿Se muestran nombres en la cancha?** No, solo el número (RN06).
- **Canchas:** catálogo fijo dentro de la app (RN05).
---
 
## Estructura de specs
 
```text
specs/
├── 00-project.md          ← este archivo
├── 01-navigation.md       ← siguiente
├── 02-data-model.md       ← User, CheckIn, Game (Court vive en constantes)
└── features/
    ├── F01-auth.md
    ├── F02-courts-map.md
    ├── F03-check-in.md
    ├── F04-court-detail.md
    ├── F05-game-crud.md
    ├── F06-game-history.md
    └── F07-player-card.md
```