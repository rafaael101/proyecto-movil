# F02 — Mapa de canchas cercanas

> **Estado:** v1.0 · **Última actualización:** 2026-11-20
> **Depende de:** `specs/00-project.md` (RN01, RN05, RN06, RN07, *Riesgos*: mapa vacío y permiso negado), `specs/01-navigation.md` (Mapa, N7, CA13, CA18, CA21, E9, E10), `specs/02-data-model.md` (*Conteo de jugadores*, operación 3, *Sin conexión*, *Errores*, E2, E6, E14, D10, D11, CAD22–CAD24), `specs/features/F01-auth.md` (F01.18) y `docs/coding-standards.md` (§4 excepciones 2 y 3, §6, §7, §8, §9, §12)

---

## Objetivo

Que el jugador vea en un mapa las canchas del catálogo (RN05) y **cuántos jugadores hay en cada una ahora** (RN01, RN06), con el color de su nivel (RN07). Tocar una cancha abre su detalle (F04).

| Requisito de la rúbrica | Cómo |
|---|---|
| Features nativas | Mapa con `react-native-maps` (la geolocalización la pone F03) |
| Backend | `obtenerCheckInsActivos` (operación 3, D11) |
| State management | `useStoreCheckIns` (lo crea F02; F03 lo amplía) |
| Testing | Unitarios CAD22–CAD24 (D10). Sin test de integración nuevo |

---

## Actor

- **Jugador con sesión:** consulta la afluencia de las canchas.
- **Firebase:** entrega los check-ins activos; la app solo muestra números (RN06).

---

## Precondiciones

- Sesión iniciada (F01). `idUsuario` sale de `useStoreSesion`.
- Existen `CANCHAS` (D4), `VistaCargando` (N4), `obtenerMensajeError` (D7) y `verificarConexion` (D8).
- D10 y D11 se hacen al inicio de este bloque (ver *Tasks*).
- **No necesita permiso de ubicación:** F02 no usa el GPS. El permiso lo pide F03 al tocar "Hacer check-in".

---

## Datos de entrada

| Dato | De dónde |
|---|---|
| Canchas | `CANCHAS` (RN05), sin internet |
| `ResumenAfluencia` | `obtenerCheckInsActivos(idUsuario)` (D11), vía el store |
| ¿Hay internet? (solo para el aviso) | `useNetInfo` en la pantalla (§4, excepción 3) |

---

## Diseño

### Constantes nuevas

**`src/constantes/tema.ts`** (lo pedía 01-navigation):

```ts
// Colores de los niveles de afluencia (RN07). Las llaves son NivelAfluencia.
// Todos llevan texto blanco encima con contraste ≥ 4.5:1.
export const coloresAfluencia = {
  vacia: '#6B6B70', // gris
  poca: '#2E7D32', // verde
  reta: '#C2410C', // naranja
  llena: '#C62828', // rojo
} as const;

export const tamanoMarcador = 36; // diámetro de la burbuja del mapa
```

**`src/constantes/configuracion.ts`:**

```ts
// Región inicial del mapa: centro y margen de las 7 canchas públicas de RN05.
// No usa la ubicación del usuario ni la cancha de prueba.
export const REGION_INICIAL: Region = {
  latitude: 31.866,
  longitude: -116.618,
  latitudeDelta: 0.06,
  longitudeDelta: 0.13,
};
```

`Region` es un tipo de `react-native-maps` (`import type`); sus campos van en inglés porque son de la librería.

### `PantallaMapa`

- `MapView` a pantalla completa con `initialRegion={REGION_INICIAL}`. Sin `showsUserLocation`.
- Un `MarcadorCancha` por cada cancha de `CANCHAS` (incluye la de prueba si está en `.env`, RN05).
- **Header:** a la derecha, icono Ionicons `refresh` (`tamanoIcono`, `colores.primario`; `colores.inactivo` y deshabilitado mientras `cargando`), con `accessibilityLabel="Actualizar"` → `cargarResumen`. Se pone con `navigation.setOptions`, igual que el [+] de Historial.
- **Arriba del mapa**, un solo elemento a la vez, en este orden:

| Si… | Se ve | Burbujas |
|---|---|---|
| `sinConexion` | `AvisoMapa` "Sin conexión: no podemos ver quién está jugando." + "Reintentar" | "?" |
| `cargando` | `ActivityIndicator` en `colores.primario`, arriba al centro | Las de antes, o "?" si `resumen` es `null` |
| `mensajeError !== null` | `AvisoMapa` con el mensaje + "Reintentar" | "?" |
| `resumen` sin canchas (`Object.keys(jugadoresPorCancha).length === 0`) | `AvisoMapa` "Nadie está jugando ahora. Sé el primero en hacer check-in." (sin botón) | "0" en gris |
| Si no | Nada | Número y color del nivel |

- `sinConexion = isConnected === false || isInternetReachable === false` (con `null` se intenta, igual que `hayConexion`, 02-data-model).
- **Número de una cancha:** `jugadoresPorCancha[idCancha] ?? 0` (una cancha que no aparece tiene 0, 02-data-model).
- **Regla de §9 para el mapa:** el mapa **nunca** se reemplaza por `VistaCargando`, `VistaError` ni `VistaVacia`, porque las canchas son locales (RN05). Sin datos confiables se ve "?", **nunca** "0" (sería mentir).
- Si `usuario` es `null` → `VistaCargando` (como en Perfil).

### Componentes nuevos — `src/componentes/`

**`MarcadorCancha.tsx`** (usa `Marker`; §4, excepción 2)

```ts
type PropsMarcadorCancha = {
  cancha: Cancha;
  jugadores: number | null; // null = sin datos → "?"
  alPresionar: (idCancha: string) => void; // → navigate('DetalleCancha', { idCancha })
};
```

- Burbuja circular de `tamanoMarcador` con borde blanco (`borderWidth: 2`, `colores.superficie`).
- Con número: fondo `coloresAfluencia[obtenerNivelAfluencia(jugadores)]`, número en `colores.textoSobrePrimario`, `tipografia.pequeno`, peso `'700'`.
- Sin datos: fondo `colores.superficie`, borde `colores.borde`, "?" en `colores.textoSecundario`.
- `onPress` del `Marker` → `alPresionar(cancha.idCancha)`. Un toque abre el detalle. Sin `title` (no sale globo).

**`AvisoMapa.tsx`**

```ts
type PropsAvisoMapa = {
  mensaje: string;
  textoBoton?: string; // por defecto "Reintentar"
  alPresionarBoton?: () => void; // sin esto, no hay botón
};
```

Tarjeta con `position: 'absolute'` arriba del mapa (margen `md`): fondo `superficie`, borde `borde`, `radio`, padding `md`. Texto `cuerpo` en `texto`; botón de texto en `primario`.

---

## Store — `src/stores/useStoreCheckIns.ts` (lo crea F02)

```ts
type EstadoCheckIns = {
  resumen: ResumenAfluencia | null; // null = no hay conteo confiable
  cargando: boolean;
  mensajeError: string | null;
  cargarResumen: (idUsuario: string) => Promise<void>;
  limpiar: () => void;
  // F03 agrega hacer y terminar check-in
};
```

**`cargarResumen(idUsuario)`**

1. Si `cargando` ya es `true`, no hace nada (doble toque en "Actualizar").
2. `cargando: true`, `mensajeError: null`.
3. `obtenerCheckInsActivos(idUsuario)` → `resumen`.
4. Si falla (§10): `console.error`, `mensajeError = obtenerMensajeError(error)` y `resumen: null` (no se muestran conteos viejos).
5. Al final, `cargando: false`.

**`limpiar()`:** `resumen: null`, `cargando: false`, `mensajeError: null`. Lo llama `cerrarSesion` (F01.18).

---

## Flujo principal

1. Al montarse Mapa (o si cambia el usuario), un `useEffect` llama a `cargarResumen(idUsuario)`. No se recarga al cambiar de tab (E11 de 01-navigation).
2. Mientras carga: indicador y burbujas "?". Luego cada burbuja muestra su número y color (RN07).
3. "Actualizar" en el header vuelve a llamar a `cargarResumen`.
4. Cuando F03 hace o termina un check-in, actualiza el mismo store y el mapa cambia solo.
5. Tocar una burbuja → `navigate('DetalleCancha', { idCancha })` (01-navigation; `navigate`, no `push`, E10).

---

## Validaciones

F02 no tiene formularios.

- **RN06:** el store y la pantalla solo reciben `ResumenAfluencia` (números y mi check-in). Nunca uids ajenos.
- **RN01:** los vencidos no llegan en la consulta (E6 de 02-data-model).
- **Cargas duplicadas:** la guarda del paso 1 de `cargarResumen`.

---

## Casos de error

| ID | Situación | Comportamiento esperado |
|---|---|---|
| E1 | **Sin internet al abrir** | Canchas visibles con "?" y aviso "Sin conexión…" (E2 de 02-data-model). Apple Maps puede verse sin calles si no tiene el mapa guardado; las burbujas igual aparecen |
| E2 | **Se va el internet** con conteos en pantalla | `useNetInfo` lo detecta: burbujas a "?" y aviso, sin tocar nada |
| E3 | Regresa el internet | El aviso cambia al de `mensajeError` (si lo hay) con "Reintentar". No se recarga solo |
| E4 | **Firebase falla** (`unavailable`, `deadline-exceeded`, `permission-denied`) | `AvisoMapa` con el mensaje de *Errores* + "Reintentar"; burbujas "?" (E14 de 02-data-model) |
| E5 | **Nadie hizo check-in** | Burbujas "0" en gris + "Nadie está jugando ahora. Sé el primero en hacer check-in." (*Riesgos* de 00-project) |
| E6 | **Permiso de ubicación negado** | No aplica a F02: el mapa se ve igual (no usa GPS). El aviso del permiso es de F03 (E9 de 01-navigation) |
| E7 | Doble toque en una burbuja o en "Actualizar" | Un solo detalle (`navigate`); una sola petición (guarda del store) |
| E8 | Cerrar sesión y entrar con otra cuenta | F01.18 limpia el store: el mapa vuelve a cargar desde cero |

---

## Resultado esperado

Al abrir la app con sesión se ve Ensenada con las canchas del catálogo. Cada una muestra cuántos jugadores hay y el color de su nivel. Sin internet o con una falla se ven las canchas con "?" y un aviso claro, nunca un "0" falso ni una pantalla en blanco.

---

## Criterios de aceptación

Probados en el iPhone con Expo Go, en la consola de Firebase y con Jest. Antes de F03, los check-ins se crean a mano en la consola: documentos en `checkins` con ids inventados (`prueba-1`, `prueba-2`…), `idCancha` y `creadoEn` = ahora (la consola no pasa por las reglas). **Se borran al terminar.**

**Mapa**

- [ ] F02-CA01 — Al abrir la tab Mapa se ve Ensenada con las 7 canchas (más la de prueba si está en `.env`) y **no** se pide permiso de ubicación.
- [ ] F02-CA02 — Sin check-ins: las burbujas muestran "0" en gris y arriba aparece "Nadie está jugando ahora. Sé el primero en hacer check-in.".
- [ ] F02-CA03 — Con 1 documento en `sullivan`, su burbuja dice "1" en verde y el aviso desaparece. Con 6 documentos, "6" en naranja. La pantalla nunca muestra uids (RN06).
- [ ] F02-CA04 — Un documento con `creadoEn` de hace más de 90 min no cuenta (RN01).
- [ ] F02-CA05 — Tocar una burbuja abre el detalle de esa cancha; con la flecha regreso al Mapa. Dos toques rápidos abren uno solo (CA18 de 01-navigation). Ya no está el botón "Ver Sullivan".
- [ ] F02-CA06 — Agrego o borro un documento en la consola y toco "Actualizar": cambia el número. Mientras carga se ve el indicador y el icono está deshabilitado.

**Sin internet y fallas**

- [ ] F02-CA07 — En modo avión abro la app: canchas con "?", aviso "Sin conexión: no podemos ver quién está jugando." y ninguna burbuja dice "0". La app no se cierra (CA21 de 01-navigation).
- [ ] F02-CA08 — Con números en pantalla activo el modo avión: pasan a "?" y aparece el aviso sin tocar nada. Quito el modo avión, toco "Reintentar" y vuelven los números.
- [ ] F02-CA09 — En la consola cambio por un momento la lectura de `checkins` a `allow read: if false;`. Al tocar "Actualizar" aparece "No tienes permiso para hacer esto." + "Reintentar" y burbujas "?". **Regreso la regla original** (D5).
- [ ] F02-CA10 — Con el permiso de ubicación negado en Ajustes, el mapa se ve y funciona igual.
- [ ] F02-CA11 — *(Después de F03)* Cierro sesión y entro con otra cuenta: el Mapa muestra el indicador y carga de nuevo (F01.18).

**Código y pruebas**

- [x] F02-CA12 — CAD22, CAD23 y CAD24 pasan en Jest (D10).
- [ ] F02-CA13 — `npx tsc --noEmit`, `npx expo lint` y `npx jest` pasan (incluidos N9 y F01.14). `PantallaMapa` no importa servicios; NetInfo solo aparece como `useNetInfo` para el aviso (§4). No queda código provisional en `PantallaMapa`.

---

## Tasks

Cada task ≈ un commit.

- ➡️ **D10 de 02-data-model** — `checkIns.ts` y `afluencia.ts` + pruebas (CAD22–CAD24).
- ➡️ **D11 de 02-data-model** — `servicioCheckIns` completo (se adelanta de F03 a aquí). CAD06–CAD09 se prueban con F03.
- [x] **F02.1 — Instalar `react-native-maps`** con `npx expo install react-native-maps` (§14). Revisar la documentación de `react-native-maps` para el SDK de `package.json`.
- [x] **F02.2 — Constantes del mapa:** `coloresAfluencia` y `tamanoMarcador` en `tema.ts`, y `REGION_INICIAL` en `configuracion.ts`.
- [x] **F02.3 — Crear `useStoreCheckIns`** con `resumen`, `cargando`, `mensajeError`, `cargarResumen` y `limpiar`.
- [x] **F02.4 — Crear `MarcadorCancha`.**
- [x] **F02.5 — Crear `AvisoMapa`.**
- [ ] **F02.6 — Simuladores de Jest para el mapa.** En `jest.setup.ts`: `react-native-maps` (fábrica que devuelve `View` como `default` y como `Marker`) y NetInfo con su simulador oficial (`@react-native-community/netinfo/jest/netinfo-mock.js`). En los tests que dibujan `NavegadorRaiz` con usuario (N9): fábrica de `servicioCheckIns` con `obtenerCheckInsActivos` que resuelve `{ jugadoresPorCancha: {}, miCheckIn: null }`, porque Mapa es la tab inicial.
- [ ] **F02.7 — `PantallaMapa` real:** `MapView`, marcadores, avisos, indicador y "Actualizar". Quita el texto de N4 y el botón "Ver Sullivan" de N7.
- [ ] **F02.8 — Probar en el iPhone** F02-CA01–CA10 y CA13 (la parte del mapa) (CA11 se prueba en F03.9), CA18 y CA21 de 01-navigation.

---

## Notas para F03 y F04

- **F03** pide el permiso de ubicación (instala `expo-location`), agrega a `useStoreCheckIns` hacer y terminar check-in, y después de cada uno llama a `cargarResumen` (02-data-model, operación 1). Así el mapa se actualiza solo.
- **F04** lee el número de su cancha del mismo `resumen` (`jugadoresPorCancha[idCancha] ?? 0`) y usa `coloresAfluencia` para su nivel.

---

## Decisiones resueltas

- **Centro del mapa:** región fija de Ensenada que abarca las 7 canchas (`REGION_INICIAL`). Sin GPS y sin punto azul.
- **Permiso de ubicación:** lo pide F03 al tocar "Hacer check-in". F02 no lo usa.
- **Marcador:** burbuja del color del nivel con el número; un toque abre el detalle. Sin datos: "?".
- **Colores de afluencia:** gris, verde, naranja y rojo (`coloresAfluencia`).
- **Recarga:** al montar Mapa, con "Actualizar" y cuando F03 cambia el check-in (mismo store). Sin recarga por tiempo ni al volver a la tab.
- **Nadie jugando:** aviso "Nadie está jugando ahora. Sé el primero en hacer check-in." arriba del mapa.
- **Store:** F02 crea `useStoreCheckIns`; D11 se adelanta al inicio de F02; la parte de check-ins de F01.18 se hace en F03.