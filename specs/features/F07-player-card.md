# F07 — Tarjeta de jugador (foto + compartir)

> **Estado:** v1.0 · **Última actualización:** 2026-11-21
> **Depende de:** `specs/00-project.md` (F07 en *MVP*, *Features nativas*, *Decisiones técnicas*: Cámara / foto y Tarjeta, *Riesgos*: permiso de cámara negado, RN10, RN11), `specs/01-navigation.md` (modal `TarjetaJugador`, *Botones del header*, E3, E5, E6, E9, CA16, CA17, CA20), `specs/02-data-model.md` (*Datos de entrada* → Foto de la tarjeta, *Errores*, E15, E16, E21, `obtenerNombreVisible`), `specs/features/F01-auth.md` (`obtenerNombreVisible`, `BotonPrincipal`, `VistaCargando`), `specs/features/F03-check-in.md` (patrón del permiso y "Abrir Ajustes"), `specs/features/F05-game-crud.md` (`VistaError`, búsqueda con `partidos.find`), `specs/features/F06-game-history.md` (icono de `FilaPartido`, `formatearFecha`, `obtenerNombreCancha`, `partidos` con caché) y `docs/coding-standards.md` (§4, §6, §7, §8, §9, §10, §12, §13, §14)

---

## Objetivo

Que el jugador arme una **tarjeta de un partido** con su foto, tomada con la cámara, elegida de la galería o sin foto, y la **comparta como imagen**. Es la segunda feature nativa de la rúbrica.

| Requisito de la rúbrica | Cómo |
|---|---|
| Features nativas | Cámara y galería con `expo-image-picker`. Compartir con `react-native-view-shot` + `expo-sharing` |
| State management | No agrega store: el estado es de una sola pantalla (§8). Vive en el hook `useTarjetaJugador` |
| Backend | No usa: lee el partido que ya está en `useStorePartidos` |
| Testing | Un `it` más en `errores.test.ts` (F07-CA12). Sin test de integración nuevo. Simuladores de las 3 librerías en `jest.setup.ts` |

---

## Actor

- **Jugador con sesión:** arma y comparte la tarjeta de **sus** partidos (RN10).
- **iPhone:** cámara, galería y hoja de compartir de iOS. La foto **nunca se guarda** (02-data-model, E21).
- **Firebase:** no participa.

---

## Precondiciones

- F06 terminada: `partidos` de `useStorePartidos` tiene las páginas cargadas o la caché, y el icono `id-card-outline` de cada fila abre el modal.
- Existen `obtenerNombreVisible` (F01), `formatearFecha` y `obtenerNombreCancha` (F06), `BotonPrincipal`, `VistaCargando`, `VistaError` y `obtenerMensajeError`.
- El modal `TarjetaJugador` ya tiene el título "Tarjeta de jugador" y el botón "Cerrar" (N6, N7).

---

## Datos de entrada

| Dato | De dónde |
|---|---|
| Partido | `partidos.find((p) => p.idPartido === route.params.idPartido)` de `useStorePartidos` (RN10, igual que F05) |
| Nombre | `obtenerNombreVisible(usuario.nombre)` de `useStoreSesion` ("Jugador" si está vacío, E15) |
| Foto | `expo-image-picker`. Su `uri` vive solo en un `useState` del hook (memoria) |
| ¿Cámara negada? | `getCameraPermissionsAsync()` al abrir la tarjeta, sin preguntar |

---

## Diseño

### Servicio nuevo — `src/servicios/servicioTarjeta.ts`

Los permisos y los módulos nativos se usan desde un servicio (§4, §10). **Solo este archivo** importa `expo-image-picker`, `react-native-view-shot` y `expo-sharing`. Cada función lleva su JSDoc (§13).

| Función | Qué hace |
|---|---|
| `camaraNegada(): Promise<boolean>` | `ImagePicker.getCameraPermissionsAsync()`. Da `true` solo si `status === 'denied'`. **No** muestra el diálogo |
| `pedirPermisoCamara(): Promise<boolean>` | `ImagePicker.requestCameraPermissionsAsync()`. Da `true` si `status === 'granted'`. La primera vez iOS muestra el diálogo de Expo Go; después responde sin preguntar |
| `abrirCamara(): Promise<string \| null>` | `ImagePicker.launchCameraAsync()`. Si `resultado.canceled` → `null`; si no → `resultado.assets[0].uri` |
| `abrirGaleria(): Promise<string \| null>` | `ImagePicker.launchImageLibraryAsync()`, igual que `abrirCamara`. En iOS, abrir la galería para elegir una foto **no** pide permiso (documentación de Expo SDK 58) |
| `compartirImagenDeVista(vista: RefObject<View \| null>): Promise<void>` | 1) Si `await Sharing.isAvailableAsync()` es `false` → lanza `new Error('sin-compartir')`. 2) `captureRef(vista, { format: 'png', quality: 1, result: 'tmpfile' })` → `uri`. 3) `Sharing.shareAsync(uri, { mimeType: 'image/png' })` |

- Sin opciones extra en la cámara y la galería: solo fotos (el valor por defecto) y sin recorte (`allowsEditing: false`, por defecto).
- **No** llaman a `verificarConexion()`: todo pasa en el teléfono (ver E7).
- `shareAsync` no avisa si el usuario compartió o canceló (solo devuelve `Promise<void>`). Los dos casos terminan igual.

**Mensaje nuevo en *Errores*:** `Error('sin-compartir')` → "Compartir no está disponible en este teléfono."

### Hook nuevo — `src/hooks/useTarjetaJugador.ts`

Guarda el estado de la tarjeta con `useState`: la foto la usa una sola pantalla y debe perderse al cerrar el modal (§8, 02-data-model). **Este hook puede importar `servicioTarjeta`** (§4: un hook usa un servicio solo si la spec lo dice). Hace el `try/catch` que en otras features hace el store (§10).

```ts
type EstadoTarjeta = {
  uriFoto: string | null; // null = sin foto
  permisoCamaraNegado: boolean;
  trabajando: boolean; // cámara, galería o compartir abiertos: nada se puede tocar
  mensaje: string | null; // error debajo de "Compartir"
  tomarFoto: () => Promise<void>;
  elegirFoto: () => Promise<void>;
  compartirTarjeta: (vista: RefObject<View | null>) => Promise<void>;
};

export function useTarjetaJugador(): EstadoTarjeta;
```

Los nombres no repiten los del servicio (como en F03 y F05).

- **Al montarse** (`useEffect`): `setPermisoCamaraNegado(await camaraNegada())`. Si falla: `console.error` y se queda en `false` (se deja intentar).
- **`tomarFoto()`**: `setMensaje(null)` y `setTrabajando(true)`. Luego, en `try/catch`:
  1. `pedirPermisoCamara()`. Si da `false`: `setPermisoCamaraNegado(true)` y termina, sin mensaje (ya se ve la explicación). Si da `true`: `setPermisoCamaraNegado(false)`.
  2. `const uri = await abrirCamara()`. Si `uri !== null` → `setUriFoto(uri)`. Si es `null` (canceló), no cambia nada.
  3. En el `catch`: `console.error('tomarFoto:', error)` y `setMensaje(obtenerMensajeError(error))`.
  4. Al final, en todos los casos: `setTrabajando(false)`.
- **`elegirFoto()`**: igual que `tomarFoto`, sin el paso 1 y con `abrirGaleria()`.
- **`compartirTarjeta(vista)`**: `setMensaje(null)` y `setTrabajando(true)`. Luego `compartirImagenDeVista(vista)` en `try/catch` (`console.error` + `obtenerMensajeError`) y `setTrabajando(false)`.
- La `uri` de la foto **no** va a ningún store, a Firestore, a AsyncStorage ni a la consola (02-data-model).

### Componentes nuevos — `src/componentes/`

**`TarjetaJugador.tsx`**: lo que se ve y se convierte en imagen. Solo props (§4).

```ts
type PropsTarjetaJugador = {
  nombre: string; // ya pasado por obtenerNombreVisible
  partido: Partido;
  uriFoto: string | null;
};
```

Fondo `superficie`, borde `borde`, `radio`, padding `lg`, todo centrado. De arriba abajo:

| # | Contenido | Estilo |
|---|---|---|
| 1 | Con foto: `Image` con `source={{ uri: uriFoto }}` y `resizeMode="cover"`. Sin foto: un `View` del mismo tamaño con Ionicons `person` en el centro | Círculo de `tamanoFotoTarjeta` (160, nuevo en `tema.ts`, §7). Sin foto: fondo `borde`, icono de `tamanoFotoTarjeta / 2` en `inactivo` |
| 2 | Nombre | `titulo`, `texto`, margen arriba `md` |
| 3 | `formatearFecha(fecha)` + " · " + "Ganó" / "Perdió" | `cuerpo`, peso `'600'`. El resultado en `exito` / `error` (como `FilaPartido`) |
| 4 | "14 pts · 6 reb · 3 ast" | `subtitulo`, `texto` |
| 5 | `obtenerNombreCancha(idCancha)` | `pequeno`, `textoSecundario` |
| 6 | "HoopsMap" | `pequeno`, peso `'600'`, `primario`, margen arriba `md` |

Sin marcador, igual que `FilaPartido`.

**`AccionesTarjeta.tsx`**: los botones y avisos de debajo de la tarjeta. Solo props (§4). Va aparte para que la pantalla no pase de ~150 líneas (§6).

```ts
type PropsAccionesTarjeta = {
  permisoCamaraNegado: boolean;
  trabajando: boolean;
  mensaje: string | null;
  alTomarFoto: () => void;
  alElegirFoto: () => void;
  alCompartir: () => void;
  alAbrirAjustes: () => void;
};
```

| Si… | Se ve |
|---|---|
| `permisoCamaraNegado` | Arriba: "HoopsMap usa la cámara solo para la foto de tu tarjeta. La foto no se guarda. Actívala en Ajustes > Expo Go > Cámara." (`pequeno`, `textoSecundario`) y el botón de texto **"Abrir Ajustes"** (`primario`) |
| Siempre | En una fila, dos botones de texto (`cuerpo`, `primario`): **"Tomar foto"** y **"Elegir de la galería"**. Debajo, `BotonPrincipal` **"Compartir"** |

- "Tomar foto" se deshabilita con `permisoCamaraNegado` o `trabajando`. "Elegir de la galería" se deshabilita con `trabajando`. Un botón de texto deshabilitado se ve en `inactivo`.
- `trabajando` → `cargando` del `BotonPrincipal`.
- `mensaje` va debajo de "Compartir", en `colores.error`, `pequeno`.
- Los textos de los botones no cambian si ya hay foto: tocarlos otra vez **reemplaza** la foto.

### `PantallaTarjetaJugador` (reemplaza la provisional de N4)

Todos los hooks arriba (§6): `usuario` de `useStoreSesion`, `partidos` de `useStorePartidos`, `vistaTarjeta = useRef<View>(null)` y `useTarjetaJugador()`.

En el orden de §9:

1. **Cargando:** `usuario === null` → `VistaCargando`. Pasa un instante si la sesión termina con el modal abierto (E5 de 01-navigation).
2. **Error:** el partido no está en `partidos` → `VistaError` "Este partido ya no existe" con `textoBoton="Cerrar"` y `goBack()` (E3 de 01-navigation, mismo código que F05).
3. **Vacío:** no aplica (es un solo partido).
4. **Datos:** `ScrollView` con fondo `fondo` y padding `md`:
   - `<View ref={vistaTarjeta}>` con `TarjetaJugador` adentro. Solo ese `View` se convierte en imagen, sin los botones.
   - Debajo (margen `md`), `AccionesTarjeta` con `alCompartir={() => compartirTarjeta(vistaTarjeta)}` y `alAbrirAjustes={() => Linking.openSettings()}` (de `react-native`, como F03).

---

## Flujo principal

1. Historial → toco el icono de tarjeta de un partido → modal "Tarjeta de jugador". Se revisa el permiso de cámara sin preguntar.
2. Veo la tarjeta sin foto (círculo gris) con mis datos.
3. Toco "Tomar foto". La primera vez iOS pide el permiso; acepto, tomo la foto y aparece en el círculo. O toco "Elegir de la galería" y elijo una.
4. Toco "Compartir". Se abre la hoja de compartir de iOS con la imagen de la tarjeta y la mando a donde quiera.
5. "Cerrar" o deslizar hacia abajo → regreso a Historial. La foto se pierde: no se guarda.

---

## Validaciones

F07 no tiene formularios.

- **RN10:** el partido solo se busca en la lista del usuario. Un id ajeno o inexistente → E1.
- **Foto en memoria:** la `uri` solo vive en el `useState` del hook (02-data-model, E21).
- **La imagen compartida:** `captureRef` la escribe como archivo temporal del teléfono, solo para pasarla a la hoja de compartir. La app no la sube a ningún lado ni la vuelve a leer.
- **Doble toque:** `trabajando` deshabilita los tres botones mientras la cámara, la galería o la hoja de compartir están abiertas.

---

## Casos de error

Listas vacías: no aplican. Sin partidos no hay ninguna fila para abrir la tarjeta (F06-E6).

| ID | Situación | Comportamiento esperado |
|---|---|---|
| E1 | **Partido inexistente** (ajeno, borrado o fuera de la lista) | `VistaError` "Este partido ya no existe" + "Cerrar" (E3 de 01-navigation). Nunca la tarjeta vacía |
| E2 | **Permiso de cámara negado** (en el diálogo o antes en Ajustes) | Explicación + "Abrir Ajustes", y "Tomar foto" deshabilitado. La galería y "Compartir" siguen funcionando (*Riesgos* de 00-project, E9 de 01-navigation, E21 de 02-data-model). Al volver de Ajustes con el permiso activo, se cierra y se reabre la tarjeta y el botón ya funciona |
| E3 | **Cancelo** la cámara o la galería | No cambia nada y no hay mensaje. Si ya había foto, se queda |
| E4 | **Cancelo** la hoja de compartir | No pasa nada y no hay mensaje (`shareAsync` no distingue cancelar de compartir) |
| E5 | **Compartir no disponible** | "Compartir no está disponible en este teléfono." debajo de "Compartir" |
| E6 | Falla la cámara, la galería o la captura con otro error | `console.error` y "Algo salió mal. Intenta de nuevo." Se puede volver a tocar |
| E7 | **Sin internet** | Funciona igual, sin aviso. El partido sale de la caché (RN11, E6 de 01-navigation) y nada de F07 usa la red |
| E8 | **Sin foto** | Círculo gris con el icono. Se comparte igual |
| E9 | Doble toque en cualquier botón | `trabajando` lo deshabilita: se abre una sola cámara, galería u hoja de compartir |
| E10 | La sesión termina con el modal abierto | `VistaCargando` un instante y el modal desaparece (E5 de 01-navigation) |
| E11 | Partido con cancha fuera del catálogo | "Cancha no disponible" (E16 de 02-data-model) |
| E12 | Usuario sin nombre | "Jugador" (E15 de 02-data-model) |
| E13 | Cierro el modal y lo vuelvo a abrir | Empieza sin foto: la foto nunca se guardó (02-data-model) |

---

## Resultado esperado

Desde un partido del Historial, el jugador ve su tarjeta, le pone una foto de la cámara o de la galería (o la deja sin foto) y la comparte como imagen. Con la cámara negada, sin internet o si cancela, ve un mensaje claro o no pasa nada, y la app nunca se cierra ni se queda en blanco.

---

## Criterios de aceptación

Probados en el iPhone con Expo Go y con Jest. Para volver a probar el diálogo del permiso: *Ajustes > Expo Go > Cámara*.

**Tarjeta**

- [ ] F07-CA01 — El icono de tarjeta del partido de F06-CA02 abre "Tarjeta de jugador" con: círculo gris con el icono, mi nombre, "2 nov 2026 · Ganó" (en verde), "14 pts · 6 reb · 3 ast", "Unidad Deportiva Juan A. Rodríguez Sullivan" y "HoopsMap". Debajo: "Tomar foto", "Elegir de la galería" y "Compartir". Con un partido sin cancha: "Sin cancha".
- [ ] F07-CA02 — "Tomar foto": la primera vez iOS pide el permiso; acepto, tomo una foto y aparece en el círculo. Tomo otra y reemplaza a la primera.
- [ ] F07-CA03 — "Elegir de la galería" abre la galería sin pedir permiso. La foto elegida aparece en el círculo.
- [ ] F07-CA04 — Abro la cámara y cancelo, y luego la galería y cancelo: la tarjeta sigue igual y no aparece ningún mensaje.
- [ ] F07-CA05 — Con foto, "Compartir" muestra el indicador y abre la hoja de compartir de iOS. Me la mando por Mensajes: la imagen es solo la tarjeta (sin botones) y se ve igual que en pantalla. Si cierro la hoja sin compartir, no aparece ningún mensaje.
- [ ] F07-CA06 — Sin foto, "Compartir" manda la tarjeta con el círculo gris.
- [ ] F07-CA07 — Con foto, toco "Cerrar" y vuelvo a abrir la misma tarjeta: está sin foto (E13). En la consola de Firebase no apareció nada nuevo.

**Negativos**

- [ ] F07-CA08 — Niego el permiso de cámara: aparece la explicación y "Abrir Ajustes", y "Tomar foto" se ve deshabilitado. "Elegir de la galería" y "Compartir" funcionan. "Abrir Ajustes" abre los ajustes de Expo Go. Activo la cámara, regreso, cierro y abro la tarjeta: "Tomar foto" funciona.
- [ ] F07-CA09 — En modo avión, con el Historial desde la caché: la tarjeta se abre con sus datos, puedo elegir una foto de la galería y "Compartir" abre la hoja.
- [ ] F07-CA10 — Toco dos veces muy rápido "Elegir de la galería": se abre una sola galería.
- [ ] F07-CA11 — CA20 de 01-navigation, parte de la tarjeta. Desde la app no se puede abrir la tarjeta con un id que no está en la lista: el icono siempre es de un partido de la lista. Se verifica en el código: `PantallaTarjetaJugador` busca con `partidos.find` y, si da `undefined`, regresa la misma `VistaError` de F05 ("Este partido ya no existe" + "Cerrar" con `goBack()`), ya probada en F05-CA07.

**Código y pruebas (Jest)**

- [ ] F07-CA12 — `obtenerMensajeError(new Error('sin-compartir'))` da "Compartir no está disponible en este teléfono." (un `it` más en `errores.test.ts`).
- [ ] F07-CA13 — `npx tsc --noEmit`, `npx expo lint` y `npx jest` pasan, incluidos N9, F01.14, F05.7 y F06.8. Solo `servicioTarjeta` importa las 3 librerías. Solo `useTarjetaJugador` importa `servicioTarjeta`. `PantallaTarjetaJugador`, `TarjetaJugador` y `AccionesTarjeta` no importan servicios (§4) y ninguno pasa de ~150 líneas (§6). No queda el texto provisional de N4. `uriFoto` no aparece en `src/stores/` ni en `servicioCache`.

---

## Tasks

Cada task ≈ un commit.

- [ ] **F07.1 — Instalar las dependencias** con `npx expo install expo-image-picker react-native-view-shot expo-sharing` (§14). Revisar su documentación para el SDK de `package.json`.
- [ ] **F07.2 — Simuladores en `jest.setup.ts`**, para que los tests que dibujan `NavegadorRaiz` no carguen los módulos nativos. Con fábrica:
  - `expo-image-picker`: `getCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'undetermined' }))`, más `requestCameraPermissionsAsync`, `launchCameraAsync` y `launchImageLibraryAsync` como `jest.fn()`.
  - `react-native-view-shot`: `captureRef: jest.fn()`.
  - `expo-sharing`: `isAvailableAsync` y `shareAsync` como `jest.fn()`.
- [ ] **F07.3 — Mensaje `'sin-compartir'`** en `obtenerMensajeError` + prueba (F07-CA12).
- [ ] **F07.4 — Crear `servicioTarjeta`** (`camaraNegada`, `pedirPermisoCamara`, `abrirCamara`, `abrirGaleria`, `compartirImagenDeVista`).
- [ ] **F07.5 — Crear `useTarjetaJugador`.**
- [ ] **F07.6 — Crear `TarjetaJugador`** y agregar `tamanoFotoTarjeta = 160` a `tema.ts`.
- [ ] **F07.7 — Crear `AccionesTarjeta`.**
- [ ] **F07.8 — `PantallaTarjetaJugador` real**: `VistaCargando`, E3 de 01-navigation con `VistaError`, la tarjeta dentro del `View` con `ref`, `AccionesTarjeta` y "Abrir Ajustes". Quita el texto provisional de N4.
- [ ] **F07.9 — Probar en el iPhone** F07-CA01–CA10 y revisar F07-CA11 en el código. Marcar CA20 de 01-navigation.

---

## Diferencias con lo visto en clase (para la defensa)

| Lo común | En HoopsMap | Por qué |
|---|---|---|
| Ejemplo de la documentación de Expo: `ImagePicker` y el permiso directo en la pantalla | En `servicioTarjeta`, llamado desde el hook `useTarjetaJugador` | §10: los permisos se piden desde un servicio. La pantalla no importa servicios (§4) |
| Lo que viene de un servicio pasa por un store de Zustand | Hook con `useState` | La foto la usa una sola pantalla y debe perderse al cerrar (§8, 02-data-model). El hook hace el `try/catch` que haría el store (§10) |
| Clase 23: guardar la foto en la galería con `expo-media-library` | La foto no se guarda: se comparte la tarjeta | 02-data-model: la foto solo vive en memoria. Sin dependencia extra |

*Antes de la defensa, revisar contra la clase 23 (Cámara, Geolocalización y Sensores) y ajustar la primera fila si el profesor lo hizo distinto.*

---

## Decisiones resueltas

- **Datos de la tarjeta:** nombre, fecha, Ganó/Perdió, puntos/rebotes/asistencias, cancha y "HoopsMap". Sin marcador.
- **Foto:** cámara **o** galería, sin recorte. Volver a tocar un botón reemplaza la foto. Sin botón de "Quitar foto".
- **Sin foto:** círculo gris con el icono Ionicons `person`. Se comparte igual.
- **Cámara negada:** como F03. Se revisa al abrir sin preguntar, explicación + "Abrir Ajustes" y "Tomar foto" deshabilitado. La galería y compartir siguen.
- **Estado:** hook `useTarjetaJugador` con `useState`, que usa `servicioTarjeta`. Sin store.
- **Sin internet:** funciona igual, sin aviso.
- **Compartir:** imagen PNG solo de la tarjeta (`captureRef` con `result: 'tmpfile'` + `shareAsync`). Cancelar no muestra nada. Si no está disponible: `'sin-compartir'`.
- **Tests:** sin test de integración nuevo. Simuladores en `jest.setup.ts` y un `it` en `errores.test.ts`.
- **CA20 (tarjeta):** se verifica en el código (F07-CA11), porque desde la app no se puede provocar.