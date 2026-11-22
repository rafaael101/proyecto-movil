# F03 — Hacer y terminar check-in en cancha

> **Estado:** v1.0 · **Última actualización:** 2026-11-20
> **Depende de:** `specs/00-project.md` (RN01–RN04, RN05 cancha de prueba, RN06, RN11, *Riesgos*: permiso negado y no poder probar desde casa), `specs/01-navigation.md` (DetalleCancha, E1, E9, CA19), `specs/02-data-model.md` (CheckIn, *Fechas → Check-in*, operaciones 1–3, *Errores*, *Sin conexión*, E1, E6–E9, E19, E20, E22, D10, D11, CAD02, CAD06–CAD09, CAD13), `specs/features/F01-auth.md` (F01.16, F01.18), `specs/features/F02-courts-map.md` (`useStoreCheckIns`, `cargarResumen`) y `docs/coding-standards.md` (§4, §8, §10, §12)

---

## Objetivo

Que el jugador **haga check-in** en una cancha cuando está a 150 m o menos (RN02), vea **cuánto le queda** (RN01) y pueda **irse antes** con "Ya me voy" (RN04). Es la feature central: alimenta los números del mapa (F02).

| Requisito de la rúbrica | Cómo |
|---|---|
| Features nativas | Geolocalización con `expo-location` (con el mapa de F02) |
| Backend | `crearCheckIn` y `terminarCheckIn` (operaciones 1 y 2, D11) |
| State management | `useStoreCheckIns` (lo crea F02; F03 lo amplía) |
| Testing | Unitario de la distancia (F03-CA13). Sin test de integración nuevo |

---

## Actor

- **Jugador con sesión:** hace y termina **su** check-in.
- **iPhone (GPS):** da la ubicación. Se usa solo en el teléfono y **nunca se guarda** (RN06, E20).
- **Firebase:** guarda `checkins/{idUsuario}` y rechaza lo que no cumpla las reglas.

---

## Precondiciones

- Sesión iniciada (F01). `idUsuario` sale de `useStoreSesion`.
- F02 terminada: D10, D11, `useStoreCheckIns` con `resumen` y `cargarResumen`.
- Existen `buscarCancha` (D4), `BotonPrincipal`, `VistaCargando`, `VistaError`, `obtenerMensajeError` y `verificarConexion`.
- Para probar RN02 desde casa: cancha de prueba en `.env` con tu ubicación (RN05). Reinicia `npx expo start` al cambiar `.env`.

---

## Datos de entrada

| Dato | De dónde |
|---|---|
| Cancha | `buscarCancha(route.params.idCancha)` (RN05) |
| Ubicación del usuario | `expo-location`, solo al tocar "Hacer check-in" |
| Mi check-in | `resumen?.miCheckIn ?? null` de `useStoreCheckIns` (F02) |
| Hora actual | `new Date()` al dibujar (sin temporizador) |

---

## Diseño

### Dónde está

El check-in vive **solo en `DetalleCancha`**: toco la burbuja en el Mapa → detalle → "Hacer check-in". El Mapa no tiene botón de check-in. F03 pone el panel en la pantalla; F04 agrega arriba el nombre y la afluencia.

### Tipo y utilidad nuevos

**`src/tipos/cancha.ts`** — `export type Coordenadas = { latitud: number; longitud: number };`. Una `Cancha` ya cumple esta forma, así que se puede pasar directo.

**`src/utilidades/distancia.ts`** (función pura, RN02):

```ts
const METROS_POR_GRADO = 111320; // 1° de latitud ≈ 111.32 km

// Pitágoras sobre el mapa. La longitud se "encoge" con cos(latitud).
// A 150 m el error frente a la fórmula de la esfera es de centímetros.
export function calcularDistanciaMetros(origen: Coordenadas, destino: Coordenadas): number {
  const latitudMedia = ((origen.latitud + destino.latitud) / 2) * (Math.PI / 180);
  const dy = (destino.latitud - origen.latitud) * METROS_POR_GRADO;
  const dx = (destino.longitud - origen.longitud) * METROS_POR_GRADO * Math.cos(latitudMedia);
  return Math.sqrt(dx * dx + dy * dy);
}

// RN02: "150 m o menos"
export function estaDentroDelRadio(distanciaMetros: number): boolean {
  return distanciaMetros <= CHECK_IN_DISTANCIA_MAXIMA_METROS;
}
```

### Servicio nuevo — `src/servicios/servicioUbicacion.ts`

Los permisos se piden desde un servicio (§10). Solo este archivo importa `expo-location`.

| Función | Qué hace |
|---|---|
| `ubicacionNegada(): Promise<boolean>` | `getForegroundPermissionsAsync()`; `true` solo si `status === 'denied'`. **No** muestra el diálogo |
| `pedirPermisoUbicacion(): Promise<boolean>` | `requestForegroundPermissionsAsync()`; `true` si `status === 'granted'`. La primera vez iOS muestra el diálogo de Expo Go; después responde sin preguntar |
| `obtenerUbicacionActual(): Promise<Coordenadas>` | `getCurrentPositionAsync({ accuracy: Location.Accuracy.High })` → `{ latitud, longitud }`. Si falla (GPS apagado, sin señal): `console.error` con el detalle y lanza `new Error('sin-ubicacion')` |

No llaman a `verificarConexion()`: el GPS funciona sin internet.

**Mensaje nuevo en *Errores*:** `Error('sin-ubicacion')` → "No pudimos obtener tu ubicación. Revisa que esté activada e intenta de nuevo."

### Componente nuevo — `src/componentes/PanelCheckIn.tsx`

Solo props (§4). Fondo `superficie`, borde `borde`, `radio`, padding `md`.

```ts
type PropsPanelCheckIn = {
  cancha: Cancha;
  miCheckIn: CheckIn | null;
  permisoNegado: boolean;
  trabajando: boolean; // indicador en el botón; nada se puede tocar
  mensaje: string | null; // error o "Estás a 420 m…"
  alHacerCheckIn: () => void;
  alTerminar: () => void; // "Ya me voy"
  alAbrirAjustes: () => void;
};
```

Con `ahora = new Date()` y `estoyAqui = miCheckIn !== null && miCheckIn.idCancha === cancha.idCancha && estaActivo(miCheckIn, ahora)`:

| Si… | Se ve |
|---|---|
| `estoyAqui` | "Estás en esta cancha" (`subtitulo`) · "Te quedan {minutosRestantes(miCheckIn, ahora)} min" (`cuerpo`, `textoSecundario`) · `BotonPrincipal` **"Ya me voy"** |
| `permisoNegado` | "HoopsMap usa tu ubicación solo para confirmar que estás a 150 m o menos de la cancha. No la guarda. Actívala en Ajustes > Expo Go > Ubicación." · botón de texto **"Abrir Ajustes"** (`primario`) · `BotonPrincipal` "Hacer check-in" **deshabilitado** |
| Si no | `BotonPrincipal` **"Hacer check-in"** |

- Si `miCheckIn` está activo en **otra** cancha, arriba del botón: "Ahora estás en {nombre}. Si haces check-in aquí, ese se termina." (`pequeno`; nombre con `buscarCancha(...)?.nombre ?? 'otra cancha'`, RN03).
- `mensaje` va debajo del botón en `colores.error`, `pequeno`. No se muestra con `permisoNegado` (ya hay explicación).
- `trabajando` → `cargando` del `BotonPrincipal` (indicador y deshabilitado, E9).
- Los minutos **no** se actualizan solos: se calculan cada vez que se dibuja el panel (igual que F02, sin recarga por tiempo). Si venció, `estaActivo` da `false` y vuelve "Hacer check-in".

### `PantallaDetalleCancha` (parte de F03)

En este orden: `usuario === null` → `VistaCargando`. Cancha no encontrada → E1 de 01-navigation (`VistaError` "No encontramos esta cancha" + "Volver al mapa"). Si no, `ScrollView` con fondo `fondo` y el `PanelCheckIn`.

- `useState`: `trabajando` (`false`) y `mensaje` (`null`), como el error del servidor de F05.
- `useEffect` al montarse → `revisarPermisoUbicacion()`.
- `alHacerCheckIn`: `setMensaje(null)`, `setTrabajando(true)`, `setMensaje(await hacerCheckIn(idUsuario, cancha))`, `setTrabajando(false)`. `alTerminar`, igual con `terminarMiCheckIn(idUsuario)`.
- `alAbrirAjustes` → `Linking.openSettings()` de `react-native` (abre los ajustes de Expo Go).

---

## Store — `useStoreCheckIns` (lo amplía F03)

```ts
// Se agrega a EstadoCheckIns de F02
permisoUbicacionNegado: boolean; // es del teléfono, no de una pantalla
revisarPermisoUbicacion: () => Promise<void>;
hacerCheckIn: (idUsuario: string, cancha: Cancha) => Promise<string | null>; // null = salió bien
terminarMiCheckIn: (idUsuario: string) => Promise<string | null>;
```

Devuelven `string | null`, igual que F01 y F05: el mensaje solo lo muestra el panel. El `mensajeError` del store sigue siendo solo del conteo (F02). Los nombres no repiten los del servicio.

**`revisarPermisoUbicacion()`** — `permisoUbicacionNegado = await ubicacionNegada()`. Si falla: `console.error` y `false` (se deja intentar).

**`hacerCheckIn(idUsuario, cancha)`**, todo en `try/catch`:

1. `await verificarConexion()`: sin internet falla **antes** de usar el GPS (CAD13, < 2 s).
2. `pedirPermisoUbicacion()`. Si es `false`: `permisoUbicacionNegado: true` y devuelve "Activa la ubicación para hacer check-in." (E20). Si es `true`: `permisoUbicacionNegado: false`.
3. `obtenerUbicacionActual()` → `calcularDistanciaMetros(ubicacion, cancha)`.
4. Si `!estaDentroDelRadio(distancia)`: devuelve `` `Estás a ${Math.round(distancia)} m de la cancha. Acércate a ${CHECK_IN_DISTANCIA_MAXIMA_METROS} m o menos para hacer check-in.` `` **Sin** llamar a Firebase (RN02).
5. `crearCheckIn(idUsuario, cancha.idCancha)` (RN01, RN03 con `setDoc`).
6. `await get().cargarResumen(idUsuario)`: el mapa y el panel se actualizan (operación 1 de 02-data-model).
7. Devuelve `null`. En el `catch`: `console.error('hacerCheckIn:', error)` y `obtenerMensajeError(error)`.

**`terminarMiCheckIn(idUsuario)`** — `terminarCheckIn(idUsuario)` → `await get().cargarResumen(idUsuario)` → `null`. Si falla: `console.error` y el mensaje.

**`limpiar()`** también deja `permisoUbicacionNegado: false`.

---

## Flujo principal

1. Mapa → toco una burbuja → DetalleCancha. Se revisa el permiso sin preguntar.
2. Toco "Hacer check-in" → indicador. Pasos 1–6 del store.
3. Si estoy cerca: el panel cambia a "Estás en esta cancha · Te quedan 90 min · Ya me voy". Al volver al Mapa, la burbuja ya subió (F02).
4. Si estoy lejos: "Estás a N m…" debajo del botón. No se guarda nada.
5. "Ya me voy" → se borra el documento (RN04) → vuelve "Hacer check-in" y la burbuja baja.
6. Si no hago nada, a los 90 min deja de contar solo (RN01, E6 de 02-data-model).
7. Al cerrar sesión, F01.16 termina el check-in (RN04).

---

## Validaciones

F03 no tiene formularios.

- **RN02:** `estaDentroDelRadio` antes de `crearCheckIn`. Las reglas no pueden revisarlo (E22 de 02-data-model).
- **RN06:** la ubicación vive solo en una variable de `hacerCheckIn`; no va al store, a Firestore ni a la consola.
- **RN05:** el `idCancha` sale del catálogo (`buscarCancha`); las reglas rechazan otro (CAD03).
- **Doble toque:** `trabajando` deshabilita el botón; aun así `setDoc` da el mismo resultado (E9).

---

## Casos de error

| ID | Situación | Comportamiento esperado |
|---|---|---|
| E1 | **Sin internet** al hacer check-in o "Ya me voy" | "No hay conexión. Revisa tu internet e intenta de nuevo." en < 2 s, sin pedir GPS. El botón sigue activo (E1 y CAD13 de 02-data-model). Sin internet el panel no sabe si tengo check-in (`resumen` es `null`, F02): muestra "Hacer check-in" |
| E2 | **Permiso negado** (en el diálogo o antes en Ajustes) | Explicación + "Abrir Ajustes"; botón deshabilitado. Al volver de Ajustes con el permiso activo, se reabre la cancha y el botón ya funciona (*Riesgos* de 00-project, E9 de 01-navigation) |
| E3 | **GPS apagado o sin señal** | `'sin-ubicacion'` → "No pudimos obtener tu ubicación…". Se puede volver a intentar |
| E4 | **Lejos** (> 150 m) | "Estás a N m de la cancha…". Firestore no se toca (RN02) |
| E5 | **Firebase falla** (`permission-denied`, `unavailable`, `deadline-exceeded`) | Mensaje de *Errores* debajo del botón. No cambia nada (E14 de 02-data-model) |
| E6 | El check-in se guarda pero `cargarResumen` falla | El check-in **sí** existe. El Mapa muestra su aviso con "Reintentar" (F02-E4); el panel muestra "Hacer check-in" hasta que el conteo cargue |
| E7 | **Nadie en la cancha** | El panel no cambia (el conteo lo muestra F02/F04). Después de mi check-in, la burbuja pasa de "0" gris a "1" verde y se va "Nadie está jugando ahora…" |
| E8 | Check-in en otra cancha con uno activo (RN03) | Aviso "Ahora estás en…". Al hacerlo, `setDoc` reemplaza el documento (E8 de 02-data-model) |
| E9 | "Ya me voy" con el check-in ya vencido | `deleteDoc` no falla (E7 de 02-data-model) |
| E10 | Cancha que no está en el catálogo | E1 de 01-navigation |
| E11 | Cierro sesión con check-in | F01.16 lo borra; sin internet vence solo (RN04, F01-E14) |

---

## Resultado esperado

En el detalle de una cancha, el jugador hace check-in solo si está a 150 m o menos. Ve cuántos minutos le quedan, puede irse con "Ya me voy" y el mapa refleja el cambio. Sin internet, sin permiso o sin GPS ve un mensaje claro y la app nunca se cierra.

---

## Criterios de aceptación

Probados en el iPhone con Expo Go, en la consola de Firebase y con Jest. "Cancha de prueba" = la del `.env` puesta donde estás (RN05). Los documentos `prueba-N` de la consola se borran al terminar.

**Check-in**

- [ ] F03-CA01 — En el Mapa no hay botón de check-in. En el detalle de cualquier cancha se ve "Hacer check-in".
- [ ] F03-CA02 — Primera vez en la cancha de prueba: iOS pide el permiso; acepto. Mientras trabaja, el botón muestra el indicador. Luego: "Estás en esta cancha", "Te quedan 90 min" y "Ya me voy". En la consola, `checkins/{mi uid}` tiene **solo** `idCancha: 'prueba'` y `creadoEn` (CAD06; sin ubicación, RN06).
- [ ] F03-CA03 — Regreso al Mapa: la burbuja de la cancha de prueba subió 1 sin tocar "Actualizar"; si era la única, desaparece "Nadie está jugando ahora…".
- [ ] F03-CA04 — Desde casa, en Sullivan: "Estás a N m de la cancha. Acércate a 150 m o menos para hacer check-in." y no aparece ni cambia ningún documento (RN02).
- [ ] F03-CA05 — "Ya me voy": vuelve "Hacer check-in", el documento ya no existe (CAD08) y la burbuja baja.
- [ ] F03-CA06 — En la consola pongo `creadoEn` de mi documento 60 min antes; "Actualizar" en el Mapa y reabro el detalle: "Te quedan 30 min". Con 100 min antes: "Hacer check-in" (RN01).
- [ ] F03-CA07 — En la consola cambio el `idCancha` de mi documento a `'sullivan'` y toco "Actualizar". En el detalle de la cancha de prueba veo "Ahora estás en Unidad Deportiva Juan A. Rodríguez Sullivan…"; hago check-in y sigue habiendo **un solo** documento con mi uid, ahora con `'prueba'` (RN03, CAD07).
- [ ] F03-CA08 — Con mi check-in y un documento `prueba-1` en `'prueba'`, la burbuja dice "2" y la app no muestra ningún uid (CAD09, RN06). Doble toque rápido en "Hacer check-in" deja un solo documento mío (E9).

**Negativos**

- [ ] F03-CA09 — Niego el permiso: explicación + "Abrir Ajustes" y botón deshabilitado; no se crea documento. "Abrir Ajustes" abre los ajustes de Expo Go. Activo la ubicación, regreso, salgo y vuelvo a entrar al detalle: el botón funciona.
- [ ] F03-CA10 — En modo avión, "Hacer check-in" muestra "No hay conexión…" en menos de 2 s (CAD13). Con check-in ya hecho y luego modo avión, "Ya me voy" muestra el mismo mensaje y el documento sigue en la consola.
- [ ] F03-CA11 — Con la ubicación del iPhone apagada en *Privacidad > Localización*, el panel no se queda cargando: muestra la explicación del permiso o "No pudimos obtener tu ubicación…".
- [ ] F03-CA12 — En la consola cambio por un momento `allow create, update` de `checkins` a `if false;`: "No tienes permiso para hacer esto." debajo del botón. **Regreso la regla original** (D5).
- [ ] F03-CA13 — Cierro sesión con check-in activo: el documento ya no existe (F01-CA20). Entro con otra cuenta: el Mapa carga desde cero (F01.18).

**Código y pruebas (Jest)**

- [ ] F03-CA14 — `src/utilidades/distancia.test.ts` pasa: mismo punto → 0; Sullivan y 0.001° más de latitud → ≈ 111 m; 0.001° más de longitud → ≈ 95 m (la corrección por coseno); Sullivan → Gimnasio Municipal entre 1 270 y 1 300 m. `estaDentroDelRadio`: 150 → `true`, 150.5 → `false`. Solo usa coordenadas del catálogo público (RN05).
- [ ] F03-CA15 — `obtenerMensajeError(new Error('sin-ubicacion'))` da su mensaje (un `it` más en `errores.test.ts`).
- [ ] F03-CA16 — `npx tsc --noEmit`, `npx expo lint` y `npx jest` pasan (N9, F01.14, F05.7 y los de F06 si ya están). Solo `servicioUbicacion` importa `expo-location`; `PantallaDetalleCancha` y `PanelCheckIn` no importan servicios (§4). Buscar las coordenadas de la cancha de prueba no da resultados (CAD30).

---

## Tasks

Cada task ≈ un commit. D10, D11 y CAD02 ya se hicieron en el bloque de F02.

- [x] **F03.1 — Instalar `expo-location`** con `npx expo install expo-location` (§14). Revisar su documentación para el SDK de `package.json`.
- [ ] **F03.2 — `Coordenadas`, `calcularDistanciaMetros` y `estaDentroDelRadio`** + pruebas (F03-CA14).
- [ ] **F03.3 — Crear `servicioUbicacion`** (`ubicacionNegada`, `pedirPermisoUbicacion`, `obtenerUbicacionActual`).
- [ ] **F03.4 — Mensaje `'sin-ubicacion'`** en `obtenerMensajeError` + prueba (F03-CA15).
- [ ] **F03.5 — Ampliar `useStoreCheckIns`**: `permisoUbicacionNegado`, `revisarPermisoUbicacion`, `hacerCheckIn`, `terminarMiCheckIn` y `limpiar`.
- [ ] **F03.6 — Simuladores de Jest.** En los tests que dibujan `NavegadorRaiz`, la fábrica de `servicioCheckIns` (F02.6) agrega `crearCheckIn` y `terminarCheckIn` como `jest.fn()`, y se agrega una fábrica de `servicioUbicacion` (las 3 funciones como `jest.fn()`), para no cargar `expo-location` real.
- [ ] **F03.7 — Crear `PanelCheckIn`.**
- [ ] **F03.8 — `PanelCheckIn` en `PantallaDetalleCancha`**: `VistaCargando`, E1 de 01-navigation, revisar el permiso al montar, `trabajando`/`mensaje` y "Abrir Ajustes". Quita el texto provisional de N4.
- ➡️ **F01.16 de F01** — `cerrarSesion` llama siempre a `terminarCheckIn` antes de `signOut`.
- ➡️ **F01.18 de F01, parte de check-ins** — `useStoreCheckIns.getState().limpiar()` en `cerrarSesion`.
- [ ] **F03.9 — Probar en el iPhone** F03-CA01–CA13, CAD06–CAD09, CAD13 (check-in), F01-CA20 y CA19 de 01-navigation.

---

## Notas para F04

- `PantallaDetalleCancha` ya trae `VistaCargando`, E1 y el `PanelCheckIn`. F04 agrega el título del header y, **arriba del panel**, el número y nivel de la cancha (`jugadoresPorCancha[idCancha] ?? 0`, "?" sin datos, como F02).

---

## Diferencias con lo visto en clase (para la defensa)

| Lo común | En HoopsMap | Por qué |
|---|---|---|
| Ejemplo de la documentación de Expo: el permiso se pide en un `useEffect` de la pantalla | Se pide en `servicioUbicacion`, al tocar "Hacer check-in" | §10: solo los servicios hablan con módulos nativos. Pedirlo al tocar explica para qué es (F02 decidió no usar GPS en el Mapa) |
| Sin internet se deshabilita el botón | El botón sigue activo y muestra "No hay conexión…" | Igual que F05: lo pide CAD13 y no hace falta NetInfo en la pantalla |
| Distancia con la fórmula de Haversine | Pitágoras con corrección por coseno | Se explica línea por línea; a 150 m la diferencia es de centímetros |

*Antes de la defensa, revisar contra la clase de geolocalización y ajustar la primera fila si el profesor lo hizo distinto.*

---

## Decisiones resueltas

- **Dónde:** solo en DetalleCancha, con el componente `PanelCheckIn`. Sin botón ni barra en el Mapa.
- **Distancia:** `calcularDistanciaMetros` (Pitágoras corregido) + `estaDentroDelRadio`, funciones puras con test.
- **Lejos:** "Estás a N m de la cancha. Acércate a 150 m o menos para hacer check-in." debajo del botón.
- **Minutos:** "Te quedan X min" se calcula al dibujar, sin temporizador.
- **Sin internet:** botón activo y mensaje al tocar, antes del GPS.
- **Permiso negado:** botón deshabilitado + explicación + "Abrir Ajustes" (`Linking.openSettings`).
- **Store:** las acciones devuelven `string | null`; `permisoUbicacionNegado` vive en el store.
- **F01.16 y la parte de check-ins de F01.18** se hacen en el bloque de F03.