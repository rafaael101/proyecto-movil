# F06 — Historial paginado, promedios y caché offline

> **Estado:** v1.0 · **Última actualización:** 2026-11-20
> **Depende de:** `specs/00-project.md` (RN05, RN10, RN11, *Listas optimizadas*), `specs/01-navigation.md` (Historial, Perfil, CA12, CA15, CA16, E8, E11), `specs/02-data-model.md` (*Operaciones* 5 y de apoyo, *Persistencia local*, *Sin conexión*, `calcularPromedios`, E3–E5, E14, E16–E18, D14–D16, CAD11–CAD15, CAD25, CAD27), `specs/features/F01-auth.md` (Perfil, F01.17, F01.18), `specs/features/F05-game-crud.md` (`useStorePartidos`, `VistaError`) y `docs/coding-standards.md` (§6, §8, §9, §12)
> **Clases de referencia:** [FlatList Avanzado](https://academy.alvesc.com/clase/class) · [Offline y Conectividad](https://academy.alvesc.com/clase/offline-y-conectividad) · [Persistencia Local](https://academy.alvesc.com/clase/persistencia-y-almacenamiento-seguro)

---

## Objetivo

Que el jugador **vea sus partidos** en una lista con *infinite scroll* (páginas de 10), **vea sus promedios** en Perfil y pueda consultar ambos **sin internet** desde la caché (RN11).

| Requisito de la rúbrica | Cómo |
|---|---|
| CRUD (leer) | Historial con `obtenerPaginaPartidos` (operación 5, la 7.ª de 7) |
| Listas optimizadas | `FlatList` con `onEndReached`, como en *FlatList Avanzado* |
| Persistencia local | Caché del historial en AsyncStorage (`servicioCache`, D16) |
| State management | `useStorePartidos` ampliado |
| Testing | CAD11, CAD15, CAD25, CAD27 (D14–D16) y **1 test de integración** (el 4.º de 4) |

---

## Actor

- **Jugador con sesión:** consulta sus partidos y promedios, con o sin internet. Solo los suyos (RN10).
- **Firebase:** entrega las páginas y la lista completa.
- **AsyncStorage:** guarda la última lista completa (RN11).

---

## Precondiciones

- F05 terminada (F05.1–F05.8): existen `useStorePartidos`, `VistaError` y el modal del formulario.
- `hayConexion` (D8), `buscarCancha` (D4) y `PARTIDOS_POR_PAGINA` (D4) ya existen.
- D14, D15 y D16 se hacen al inicio de este bloque (ver *Tasks*).

---

## Datos de entrada

| Dato | De dónde |
|---|---|
| `idUsuario` | `useStoreSesion` (F01) |
| Páginas de 10 y lista completa | `obtenerPaginaPartidos` y `obtenerTodosLosPartidos` (D14) |
| Caché (`CacheHistorial`) | `leerCacheHistorial` (D16) |
| ¿Hay internet? | `hayConexion` (D8), lo llama el store |

---

## Diseño

### Historial (`PantallaHistorial`)

- Header: el [+] de N7 se queda (con su `accessibilityLabel`, F05.7). Se quitan **los dos** botones provisionales de N7 y `ID_PARTIDO_PRUEBA`.
- Si hay caché en pantalla (`guardadoEn !== null`): `AvisoSinConexion` fijo arriba de la lista.
- `FlatList` como en clase: `keyExtractor={(partido) => partido.idPartido}`, `onEndReached` → `cargarMas`, `onEndReachedThreshold={0.5}`, `ListFooterComponent`:
  - `cargandoMas` → `ActivityIndicator` en `colores.primario`;
  - `mensajeErrorMas` → el mensaje en `colores.error` y un botón de texto "Reintentar" (→ `cargarMas`);
  - si no, `null`.

### Componentes nuevos — `src/componentes/`

**`FilaPartido.tsx`**

```ts
type PropsFilaPartido = {
  partido: Partido;
  alPresionar: (idPartido: string) => void; // → navigate('FormularioPartido', { idPartido })
  alPresionarTarjeta: (idPartido: string) => void; // → navigate('TarjetaJugador', { idPartido })
};
```

| Línea | Contenido | Estilo |
|---|---|---|
| 1 | `formatearFecha(fecha)` + " · " + "Ganó" / "Perdió" | `cuerpo`, peso `'600'`; el resultado en `exito` / `error` |
| 2 | "14 pts · 6 reb · 3 ast" | `cuerpo`, `texto` |
| 3 | `obtenerNombreCancha(idCancha)` | `pequeno`, `textoSecundario` |

- Toda la fila es un `TouchableOpacity` (`alPresionar`). Fondo `superficie`, `radio`, padding `md`, separación `sm`.
- A la derecha, el **control de tarjeta** (lo pedía 01-navigation): `TouchableOpacity` con Ionicons `id-card-outline`, `tamanoIcono`, `colores.primario`, `accessibilityRole="button"` y `accessibilityLabel="Ver tarjeta"`.
- No se muestra el marcador.

**`VistaVacia.tsx`** — mensaje centrado (`cuerpo`, `textoSecundario`, fondo `fondo`). Prop: `mensaje: string`. Es la primera feature que la usa (§6).

**`AvisoSinConexion.tsx`** — se usa en Historial y Perfil.

```ts
type PropsAvisoSinConexion = {
  guardadoEn: string; // ISO de la caché
  alReintentar: () => void; // → cargarHistorial
};
```

Texto "Sin conexión — datos guardados el 2 nov, 18:40" (`formatearFechaHora`), `pequeno`, `textoSecundario`, y un botón de texto "Reintentar" en `primario`. Fondo `superficie`, borde `borde`.

**`ResumenPromedios.tsx`** — la sección de Perfil, entre el correo y "Cerrar sesión" (F01).

```ts
type PropsResumenPromedios = {
  promedios: Promedios | null;
  cargando: boolean;
  mensajeError: string | null;
  guardadoEn: string | null;
  alReintentar: () => void;
};
```

- Título "Mis promedios" (`subtitulo`). Después, en el orden de §9: `cargando` → `ActivityIndicator`; `mensajeError` → texto en `error` + "Reintentar"; `promedios` → `AvisoSinConexion` (si `guardadoEn !== null`) y 5 filas etiqueta–valor:
  - "Partidos jugados" y "Victorias" (enteros);
  - "Puntos por partido", "Rebotes por partido" y "Asistencias por partido" con `toFixed(1)` (`15.0`).
- Con 0 partidos se ven los ceros (E17 de 02-data-model). No hay estado "vacío" aparte.

### Utilidades nuevas (funciones puras)

| Función | Archivo | Ejemplo |
|---|---|---|
| `formatearFecha(fecha: string): string` | `fechas.ts` | `'2026-11-02'` → `'2 nov 2026'` |
| `formatearFechaHora(iso: string): string` | `fechas.ts` | → `'2 nov, 18:40'` (hora local, minutos con 2 dígitos) |
| `obtenerNombreCancha(idCancha: string \| null): string` | `canchas.ts` | `null` → "Sin cancha" · no está en el catálogo → "Cancha no disponible" (E16) · si existe → su nombre |

- Meses en un arreglo `['ene', 'feb', …, 'dic']`. Nada de `toLocaleDateString`.
- **Trampa que se evita:** `formatearFecha` separa el texto con `split('-')`. `new Date('2026-11-02')` lo lee como UTC, y en Ensenada daría **1 nov**.

---

## Store — `src/stores/useStorePartidos.ts` (lo amplía F06)

```ts
type EstadoPartidos = {
  partidos: Partido[]; // lo que muestra el Historial: las páginas cargadas o la caché
  promedios: Promedios | null; // null = todavía no se carga
  cursor: CursorPartidos | null;
  hayMas: boolean;
  cargando: boolean; // primera carga → VistaCargando
  cargandoMas: boolean; // siguiente página → indicador en el pie
  mensajeError: string | null; // falla la primera carga → VistaError
  mensajeErrorMas: string | null; // falla "cargar más" → mensaje en el pie; la lista se queda
  guardadoEn: string | null; // distinto de null = se está mostrando la caché
  cargarHistorial: (idUsuario: string) => Promise<void>;
  cargarMas: (idUsuario: string) => Promise<void>;
  // + registrarPartido, actualizarPartido, borrarPartido (F05) y limpiar
};
```

**`cargarHistorial(idUsuario)`**

1. Si `cargando` ya es `true`, no hace nada.
2. `cargando: true` y borra los dos mensajes.
3. **Sin internet** (`hayConexion()` da `false`): `leerCacheHistorial(idUsuario)`.
   - `null` → `mensajeError: 'Sin conexión y sin datos guardados'` (E3 de 02-data-model).
   - Si hay caché → `partidos` = los de la caché (completos), `promedios = calcularPromedios(...)`, `hayMas: false`, `cursor: null` y `guardadoEn` = el de la caché.
4. **Con internet:** `obtenerPaginaPartidos(idUsuario, null)` y `obtenerTodosLosPartidos(idUsuario)`. Luego `guardarCacheHistorial(idUsuario, todos)` en su propio `try/catch`: si falla, `console.error` y se sigue. Después: `partidos` = página 1, `cursor`, `hayMas`, `promedios = calcularPromedios(todos)` y `guardadoEn: null`.
5. Todo dentro de `try/catch` (§10): `console.error` + `mensajeError = obtenerMensajeError(error)`. Al final, `cargando: false`.

**`cargarMas(idUsuario)`** — guarda de la clase: `if (cargando || cargandoMas || !hayMas || cursor === null) return;`. Pide `obtenerPaginaPartidos(idUsuario, cursor)` y **agrega** los partidos al final. Si falla: `mensajeErrorMas`, sin tocar `partidos`.

**Recarga después de F05:** si `registrarPartido`, `actualizarPartido` o `borrarPartido` salen bien, **esperan** `get().cargarHistorial(idUsuario)` y luego devuelven `null`. El modal se cierra con la lista y los promedios ya al día (página 1, operación 5 de 02-data-model). Si fallan, no recargan.

**`limpiar()`** deja todo como al inicio: listas vacías, `promedios`, `cursor`, `guardadoEn` y mensajes en `null`, banderas en `false`.

---

## Flujo principal

### A. Primera carga

1. Historial y Perfil, al montarse: si `promedios === null`, llaman a `cargarHistorial(idUsuario)`. Así no importa cuál se abre primero, y no se vuelve a cargar al cambiar de tab (CA12). Si `usuario` es `null` → `VistaCargando` (como F05 y Perfil).
2. Historial revisa en el orden de §9: `cargando` → `VistaCargando`; `mensajeError` → `VistaError` con "Reintentar"; `partidos.length === 0` → `VistaVacia` "Aún no registras partidos"; si no, la `FlatList`. El aviso de caché va arriba en los dos últimos casos.

### B. Infinite scroll

1. Al acercarse al final, `onEndReached` → `cargarMas`. Mientras tanto se ve el indicador en el pie.
2. Cuando `hayMas` es `false` (o se ve la caché) ya no se pide nada.

### C. Tocar un partido

- Fila → "Editar partido" (F05, flujo B). Icono → "Tarjeta de jugador" (F07).
- Sin internet también se abre (E8 de 01-navigation). F05 bloquea al guardar (RN11).

### D. Después de guardar o eliminar (F05)

El store recarga (ver *Store*). Mientras tanto, Historial muestra `VistaCargando` y luego la lista desde arriba. Perfil muestra sus promedios nuevos.

### E. Regresa el internet

"Reintentar" del aviso → `cargarHistorial`. Ya con internet, el aviso desaparece y la lista vuelve a paginar.

---

## Validaciones

F06 no tiene formularios. Lo que protege los datos:

- **RN10:** el store siempre usa el `idUsuario` de la sesión; las reglas de Firestore rechazan otra ruta (E11 de 02-data-model).
- **Caché ajena o rota:** `leerCacheHistorial` revisa `idUsuario` y la forma del JSON, y devuelve `null` (E4 y E5 de 02-data-model).
- **Cargas duplicadas:** las guardas de `cargarHistorial` y `cargarMas`.

---

## Casos de error

Permisos de ubicación y cámara **no aplican** (F06 no los usa).

| ID | Situación | Comportamiento esperado |
|---|---|---|
| E1 | **Sin internet, con caché** | Aviso con fecha + **todos** los partidos guardados, sin pie (RN11). Perfil: promedios de la caché + aviso |
| E2 | **Sin internet, sin caché** (cuenta nueva, o caché rota o ajena) | `VistaError` "Sin conexión y sin datos guardados" + "Reintentar". En Perfil, el mismo mensaje dentro de su sección |
| E3 | Se va el internet al bajar por la lista | En el pie: "No hay conexión. Revisa tu internet e intenta de nuevo." + "Reintentar". La lista no desaparece |
| E4 | **Firebase falla** en la primera carga (`unavailable`, `deadline-exceeded`, `permission-denied`) | `VistaError` con el mensaje de la tabla *Errores* + "Reintentar" (E14 de 02-data-model). Solo "sin internet" usa la caché |
| E5 | Falla guardar la caché | `console.error`; la lista y los promedios se muestran igual |
| E6 | **Lista vacía** | `VistaVacia` "Aún no registras partidos"; Perfil en ceros, nunca `NaN` (E17). Sin internet con caché vacía: aviso + `VistaVacia` |
| E7 | Exactamente 10, 20… partidos | Una petición extra regresa vacía y el pie desaparece (E18) |
| E8 | `onEndReached` se dispara dos veces seguidas | La guarda deja pasar una sola petición: no hay partidos repetidos |
| E9 | Partido con cancha fuera del catálogo | "Cancha no disponible" (E16) |
| E10 | Se guarda en F05 pero la recarga falla | El modal se cierra (sí se guardó). Historial muestra E2/E4 con "Reintentar" |
| E11 | Cerrar sesión y entrar con otra cuenta | Caché borrada (F01.17) y store limpio (F01.18): no aparece nada de la cuenta anterior (RN10, RN11) |

---

## Resultado esperado

El jugador ve sus partidos de 10 en 10, con una fila clara y acceso a editar y a la tarjeta, y sus promedios en Perfil. Sin internet ve lo último descargado con la fecha de guardado. Nunca ve partidos ajenos, pantallas en blanco ni `NaN`.

---

## Criterios de aceptación

Probados en el iPhone con Expo Go, en la consola de Firebase y con Jest.

**Historial**

- [ ] F06-CA01 — Con una cuenta nueva, Historial muestra "Aún no registras partidos" y Perfil muestra 0 partidos y `0.0` en los promedios.
- [ ] F06-CA02 — Un partido del 2 nov en Sullivan, ganado, con 14/6/3, se ve como "2 nov 2026 · Ganó" (en verde), "14 pts · 6 reb · 3 ast" y "Unidad Deportiva Juan A. Rodríguez Sullivan". Sin cancha → "Sin cancha".
- [ ] F06-CA03 — Con 23 partidos llegan 10 al abrir. Al bajar aparece el indicador en el pie y llegan 10 más, y luego 3. Después ya no aparece el indicador (CAD11).
- [ ] F06-CA04 — Tocar la fila abre "Editar partido" con sus datos (F05-CA08). Tocar el icono abre "Tarjeta de jugador" (CA16 de 01-navigation). Ya no están los botones provisionales.
- [ ] F06-CA05 — Al crear un partido con fecha de hoy, el modal se cierra y aparece primero en la lista; en Perfil cambian los promedios. Al editarlo cambia su fila; al eliminarlo desaparece (F05-CA10).
- [ ] F06-CA06 — Bajo hasta la segunda página, voy a Perfil (aunque sea la primera vez) y regreso: el scroll sigue donde estaba (CA12 de 01-navigation).

**Sin internet y fallas**

- [ ] F06-CA07 — Abro Historial con internet, activo el modo avión y cierro y abro la app: Historial muestra "Sin conexión — datos guardados el …" con la fecha y la hora, y todos los partidos. Perfil muestra los promedios con el mismo aviso (CAD14).
- [ ] F06-CA08 — Con una cuenta que nunca abrió Historial, en modo avión: "Sin conexión y sin datos guardados" + "Reintentar". Quito el modo avión, toco "Reintentar" y se carga la lista.
- [ ] F06-CA09 — Con el aviso en pantalla, quito el modo avión y toco "Reintentar" del aviso: el aviso desaparece y la lista vuelve a paginar.
- [ ] F06-CA10 — Con 23 partidos, cargo la página 1, activo el modo avión y bajo: el pie muestra "No hay conexión…" + "Reintentar". Quito el modo avión, toco "Reintentar" y llega la página 2.
- [ ] F06-CA11 — En la consola cambio por un momento la regla de partidos a `allow read: if false;`. Al tocar "Reintentar" aparece "No tienes permiso para hacer esto.". **Regreso la regla original** (D5).

**Cerrar sesión**

- [ ] F06-CA12 — F01-CA21: cierro sesión y entro con otra cuenta. Ni con internet ni en modo avión aparece nada de la cuenta anterior (CAD15).

**Pruebas (Jest)**

- [x] F06-CA13 — `formatearFecha('2026-11-02')` da `'2 nov 2026'` (no `'1 nov'`). `formatearFechaHora(new Date(2026, 10, 2, 18, 5).toISOString())` da `'2 nov, 18:05'`. `obtenerNombreCancha`: `null`, `'no-existe'` y `'sullivan'`.
- [ ] F06-CA14 — **Integración — `PantallaHistorial`** (`src/pantallas/PantallaHistorial.test.tsx`). Se dibuja `NavegadorRaiz` con `usuario` de prueba y `revisandoSesion: false`, y `useStorePartidos.getState().limpiar()` antes de cada `it`. Se simulan con fábrica: `servicioSesion` (como N9), `servicioCheckIns` (como F02.6), `servicioPartidos` (las 5 funciones), `servicioConexion` (`hayConexion` resuelve `false`) y `servicioCache`. El test toca la tab "Historial" y:
  1. `leerCacheHistorial` resuelve una caché con el partido de F06-CA02 → aparecen "Sin conexión — datos guardados el" y "14 pts · 6 reb · 3 ast". `obtenerPaginaPartidos` **no** se llamó.
  2. `leerCacheHistorial` resuelve `null` → aparece "Sin conexión y sin datos guardados".

  `render` y `fireEvent` llevan `await` (Testing Library v14).

**Código**

- [ ] F06-CA15 — `npx tsc --noEmit`, `npx expo lint` y `npx jest` pasan. `PantallaHistorial` y `PantallaPerfil` no importan servicios (§4). No queda código provisional en `PantallaHistorial`.

---

## Tasks

Cada task ≈ un commit.

- ➡️ **D14 de 02-data-model** — `obtenerPaginaPartidos` y `obtenerTodosLosPartidos` (CAD11 se prueba en F06.9).
- ➡️ **D15 de 02-data-model** — `calcularPromedios` + pruebas (CAD25).
- ➡️ **D16 de 02-data-model** — `servicioCache` + pruebas (CAD15, CAD27).
- [x] **F06.1 — `formatearFecha`, `formatearFechaHora` y `obtenerNombreCancha`** + pruebas (F06-CA13).
- [x] **F06.2 — Ampliar `useStorePartidos`**: estado de la lista, `cargarHistorial` (con caché sin internet), `cargarMas` y `limpiar` completo.
- [ ] **F06.3 — Recargar después de guardar**: las 3 acciones de F05 esperan `cargarHistorial` si salen bien.
- [ ] **F06.4 — Crear `VistaVacia` y `AvisoSinConexion`.**
- [ ] **F06.5 — Crear `FilaPartido`** (3 líneas e icono de tarjeta).
- [ ] **F06.6 — `PantallaHistorial` real**: 4 estados, `FlatList` con pie y aviso. Quita los provisionales de N7.
- [ ] **F06.7 — `ResumenPromedios` en `PantallaPerfil`**, entre el correo y "Cerrar sesión".
- [ ] **F06.8 — Test de integración** (F06-CA14).
- ➡️ **F01.17 de F01** — borrar la caché al cerrar sesión (ya existe D16).
- ➡️ **F01.18 de F01, solo la parte de partidos** — `useStorePartidos.getState().limpiar()`. La parte de check-ins la hace F03.
- [ ] **F06.9 — Probar en el iPhone** F06-CA01–CA12, F05-CA08–CA10 (y la parte de "Eliminar" de F05-CA11), CAD11–CAD14, y CA12, CA15 y CA16 de 01-navigation. Para los 23 partidos sirve el formulario o la consola.

**Nota para los tests ya hechos (F06.6 y F06.7):** desde que Historial y Perfil usan `useStorePartidos`, los tests que dibujan `NavegadorRaiz` (N9, F01.14, F05.7) cargan ese store. Si truenan porque se cargan Firebase o NetInfo reales, se agrega en esos tests el simulador con fábrica de `servicioPartidos`, `servicioConexion` y `servicioCache` (§12). En el de F05.7, la fábrica de `servicioPartidos` también trae `obtenerPaginaPartidos` y `obtenerTodosLosPartidos`.

---

## Diferencias con lo visto en clase (para la defensa)

| En clase | En HoopsMap | Por qué |
|---|---|---|
| `page` numérico y `fetchProducts(page)` | `cursor` (último documento leído) | Firestore pagina con `startAfter`, no con números de página (02-data-model) |
| Estado de la lista en `useState` del componente | En `useStorePartidos` | La usan Historial, Perfil y el modal de F05 (§8) |
| Fila envuelta en `memo` y `getItemLayout` | No se usan | Con páginas de 10 no hace falta. Con `memo` habría que agregar `useCallback` para que sirviera |
| `useNetInfo` en la pantalla | El store llama a `hayConexion()` | Una sola decisión ("¿uso la caché?") en un solo lugar; la pantalla solo lee `guardadoEn` |

---

## Decisiones resueltas

- **Fila:** fecha, resultado con color, puntos/rebotes/asistencias y cancha. Sin marcador.
- **Control de tarjeta:** icono `id-card-outline` a la derecha de cada fila.
- **Recarga después de F05:** el store recarga (página 1 + todos) antes de devolver `null`.
- **Cuándo se carga:** al montarse Historial o Perfil, solo si `promedios === null`. No se recarga al cambiar de tab.
- **Sin internet:** solo si `hayConexion()` es `false` se usa la caché, y se muestra completa, sin paginar. Los otros errores muestran `VistaError`.
- **Volver a cargar:** botón "Reintentar" en el aviso. No hay "jalar para recargar".
- **Provisionales de N7:** F06 quita los dos.
- **Test de integración:** F06 aporta el 4.º (Historial sin internet).
- **F01.17 y F01.18 (partidos):** se hacen en este bloque.

---