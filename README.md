# HoopsMap

App móvil para jugadores recreativos de básquetbol. Un **mapa** muestra cuánta gente hay en cada cancha gracias a check-ins temporales, y una **bitácora** guarda tus partidos, tus promedios y una tarjeta de jugador para compartir.

Proyecto individual de la materia **Aplicaciones Móviles** (noviembre de 2026), hecho con **Spec-Driven Development**: primero la spec, después el código.

- **Stack:** React Native + Expo SDK 58 + TypeScript (strict)
- **Probado en:** iPhone con Expo Go

---

## Qué hace

| ID | Feature | Qué puede hacer el usuario |
|---|---|---|
| F01 | Sesión | Crear cuenta (nombre, correo y contraseña), iniciar sesión (se guarda) y cerrarla |
| F02 | Mapa de canchas | Ver las canchas en el mapa con un número y un color según cuánta gente hay |
| F03 | Check-in | Avisar que está en una cancha (a 150 m o menos). Cuenta 90 min, y "Ya me voy" lo termina antes |
| F04 | Detalle de cancha | Ver el nombre, el nivel de afluencia y el panel de check-in |
| F05 | Partidos (CRUD) | Registrar, editar y eliminar partidos con formulario validado |
| F06 | Historial y promedios | Lista paginada (10 por página), promedios en Perfil y lectura sin internet desde la caché |
| F07 | Tarjeta de jugador | Tarjeta de un partido con foto (cámara o galería), compartida como imagen |

Las reglas de negocio (RN01–RN11) están en [`specs/00-project.md`](specs/00-project.md).

---

## Abrir la app

**Liga de EAS Update:** https://expo.dev/accounts/rafaael101/projects/proyecto-final/updates/2a5ee5cc-69ee-43f2-a972-1769058bbff2

> La liga abre en **Expo Go** solo para cuentas que son miembros del proyecto en expo.dev; para las demás da error 403. Por eso la demostración en clase corre desde la laptop con `npx expo start`.

### Correrla en tu computadora

Necesitas Node.js, Git y la app **Expo Go** en el teléfono, además de un proyecto de Firebase con Authentication (correo y contraseña) y Firestore. En Firestore publica las reglas de [`firestore.rules`](firestore.rules).

```bash
git clone https://github.com/rafaael101/proyecto-movil.git
cd proyecto-movil
npm install                # instala las dependencias que ya están en package.json
cp .env.example .env       # luego llena las variables de Firebase en .env
npx expo start             # escanea el QR con la cámara del iPhone
```

- Las variables `EXPO_PUBLIC_CANCHA_PRUEBA_LAT` y `EXPO_PUBLIC_CANCHA_PRUEBA_LNG` son opcionales: agregan una cancha de prueba para probar el check-in sin ir a una cancha real. Si están vacías, esa cancha no aparece.
- Si cambias `.env`, reinicia `npx expo start`.

### Pruebas y calidad

```bash
npx tsc --noEmit   # TypeScript
npx expo lint      # ESLint
npx jest           # 15 suites, 87 tests
```

---

## Arquitectura

### Capas: quién habla con quién

```text
Pantalla ──usa──► Store (Zustand) ──llama──► Servicio ──habla con──► Firebase / AsyncStorage / NetInfo / Expo
   │
   ├──usa──► Hook (estado local: useFormulario, useTarjetaJugador)
   └──muestra──► Componentes (solo props y callbacks)

Todas las capas pueden usar: utilidades (funciones puras), constantes y tipos.
```

- **Pantallas** (`src/pantallas/`): leen los stores, arman los componentes y muestran los 4 estados: cargando, error, vacío y datos.
- **Stores** (`src/stores/`): guardan el estado global (sesión, check-ins y partidos). Atrapan los errores y los traducen a mensajes en español.
- **Servicios** (`src/servicios/`): son el **único** lugar que habla con Firebase, AsyncStorage, NetInfo, la ubicación y la cámara. Revisan la conexión antes de llamar a Firebase.
- **Utilidades** (`src/utilidades/`): funciones puras (distancia, nivel de afluencia, promedios, validaciones, fechas). Ahí están los tests unitarios.

### Navegación (8 pantallas: Stack + Tabs + Modal)

```text
NavegadorRaiz (Stack)
├── Sin sesión: InicioSesion, Registro
└── Con sesión:
    ├── Principal (Tabs): Mapa · Historial · Perfil
    ├── DetalleCancha ........ stack
    ├── FormularioPartido .... modal (crear / editar)
    └── TarjetaJugador ....... modal
```

Lo que se muestra depende del store de sesión: al iniciar o cerrar sesión, el Stack cambia de grupo sin llamar a `navigate`.

### Datos

| Dónde | Qué guarda |
|---|---|
| Firebase Auth | Usuario: uid, correo y nombre |
| Firestore `checkins/{uid}` | El check-in activo de cada usuario (uno por usuario, RN03) |
| Firestore `usuarios/{uid}/partidos` | Los partidos de cada usuario; solo el dueño puede leerlos y cambiarlos (RN10) |
| AsyncStorage | La sesión de Firebase y la caché del historial (RN11) |
| `src/constantes/canchas.ts` | El catálogo fijo de 7 canchas (RN05) |

### Carpetas

```text
src/
├── navegacion/    navegadores y tipos de parámetros
├── pantallas/     las 8 pantallas
├── componentes/   piezas de UI reutilizables
├── hooks/         useFormulario, useTarjetaJugador
├── stores/        Zustand: sesión, check-ins, partidos
├── servicios/     Firebase, AsyncStorage, NetInfo, ubicación, cámara
├── utilidades/    funciones puras + sus tests
├── constantes/    tema, configuración, canchas
└── tipos/         tipos de las entidades
```

---

## Documentación

| Documento | Qué tiene |
|---|---|
| [`specs/00-project.md`](specs/00-project.md) | Visión, MVP, reglas de negocio, decisiones técnicas y riesgos (fuente de verdad) |
| [`specs/01-navigation.md`](specs/01-navigation.md) | Pantallas, parámetros, paleta y tipografía |
| [`specs/02-data-model.md`](specs/02-data-model.md) | Tipos, Firestore, servicios, caché, validaciones y mensajes de error |
| [`specs/features/`](specs/features/) | Specs de F01 a F07 con sus criterios de aceptación |
| [`docs/coding-standards.md`](docs/coding-standards.md) | Estándar de código |
| [`docs/bitacora-ia.md`](docs/bitacora-ia.md) | Bitácora de IA: cómo usé Claude y Claude Code |
| [`docs/diario-decisiones.md`](docs/diario-decisiones.md) | Diario de decisiones |
| [`CLAUDE.md`](CLAUDE.md) | Instrucciones para Claude Code |
