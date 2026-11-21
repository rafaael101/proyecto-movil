# F05 — Registrar, editar y eliminar partido (CRUD)

> **Estado:** v1.0 · **Última actualización:** 2026-11-20
> **Depende de:** `specs/00-project.md` (RN08, RN09, RN10, RN11), `specs/01-navigation.md` (modal `FormularioPartido`, E2, E4, E8), `specs/02-data-model.md` (Partido, *Validaciones → Partido*, *Operaciones* 4, 6 y 7, *Errores*, E1, E10–E13, E16, D12, D13), `specs/features/F01-auth.md` (`useFormulario`, `CampoTexto`, `BotonPrincipal`) y `docs/coding-standards.md` (§6, §8, §10, §11, §12)
> **Clases de referencia:** [Validación de Formularios](https://academy.alvesc.com/clase/validacion-formularios) · [Custom Hook de Formulario](https://academy.alvesc.com/clase/custom-hook-formulario) · [TextInput y Teclado](https://academy.alvesc.com/clase/textinput-teclado)

---

## Objetivo

Que el jugador **registre** un partido con sus estadísticas, lo **edite** y lo **elimine**, con el tercer formulario validado de la rúbrica. Leer la lista de partidos es F06.

| Requisito de la rúbrica | Cómo |
|---|---|
| CRUD | Crear, editar y eliminar (leer: F06) |
| Formularios validados (3 de 3) | Formulario de partido |
| Backend | `crearPartido`, `editarPartido`, `eliminarPartido` (3 de las 7) |
| State management | `useStorePartidos` (lo crea F05; F06 lo amplía) |
| Testing | Unitarias CAD17–CAD21 (D12) y **1 test de integración** (el 3.º de 4) |

---

## Actor

- **Jugador con sesión:** captura sus estadísticas (RN08) y modifica solo sus partidos (RN10).
- **Firebase:** guarda el partido y rechaza lo que no cumpla las reglas (02-data-model).

---

## Precondiciones

- Sesión iniciada (F01). El `idUsuario` sale de `useStoreSesion`.
- Existen `useFormulario`, `CampoTexto`, `BotonPrincipal` y `VistaCargando` (F01, N4).
- Existen `obtenerFechaHoy` (D7), `obtenerMensajeError` (D7), `verificarConexion` (D8) y `buscarCancha` / `CANCHAS` (D4).
- Navegación del modal lista (N7): título "Nuevo partido" / "Editar partido" y botón "Cancelar".
- **Modo editar:** busca el partido en `partidos` de `useStorePartidos`, que llena F06. **Antes de F06 la lista está vacía**, así que todo "Editar" muestra E2.

---

## Datos de entrada

Tipos `ValoresFormularioPartido` y `ErroresPartido` de 02-data-model (ya están en `src/tipos/partido.ts`).

| Campo | Control | Valor inicial (crear) | Valor inicial (editar) |
|---|---|---|---|
| Fecha | `CampoTexto` · placeholder "AAAA-MM-DD" · `keyboardType="numbers-and-punctuation"` · `autoCorrect={false}` | `obtenerFechaHoy(new Date())` | `convertirAValores(partido)` |
| Cancha (opcional) | `SelectorOpciones`: "Sin cancha" + `CANCHAS` | `null` ("Sin cancha") | 〃 |
| Resultado | `SelectorOpciones`: "Ganó" / "Perdió" | `null` (ninguno) | 〃 |
| Puntos, Rebotes, Asistencias | `CampoTexto` · `keyboardType="number-pad"` · placeholders "Tus puntos", "Tus rebotes", "Tus asistencias" | `''` | 〃 |
| Marcador final (opcional) | Dos `CampoTexto` en una fila: "Tu equipo" y "Rival" · `number-pad` | `''` | 〃 |

---

## Diseño

- `KeyboardAvoidingView` (`behavior="padding"` en iOS) + `ScrollView` con `keyboardShouldPersistTaps="handled"` (para que tocar un chip no solo cierre el teclado). Colores, tipografía y espaciado de `tema.ts`.
- Orden: Fecha → Cancha → Resultado → Puntos / Rebotes / Asistencias → Marcador final → error del servidor → botón **"Guardar"** → (solo editar) **"Eliminar partido"**.
- **Error del servidor:** texto en `colores.error`, `tipografia.pequeno`, arriba de "Guardar" (igual que F01). Se guarda en un `useState<string | null>` del formulario.
- **Error del marcador:** se muestra **una vez**, debajo de la fila, si `tocados.marcadorPropio` o `tocados.marcadorRival` (02-data-model). Los dos campos usan `alSalir={manejarSalida('marcadorPropio')}`: salir de cualquiera vuelve a validar el marcador, porque su error vive en `marcadorPropio`.
- **"Eliminar partido":** botón de texto en `colores.error`, centrado, debajo de "Guardar".
- Mientras guarda o elimina: "Guardar" con indicador (`cargando`), y campos, chips y "Eliminar partido" deshabilitados.

### Componentes nuevos — `src/componentes/`

**`SelectorOpciones.tsx`** (se usa dos veces: cancha y resultado)

```ts
type OpcionSelector = { valor: string; etiqueta: string };

type PropsSelectorOpciones = {
  etiqueta: string; // "Cancha (opcional)" o "Resultado"
  opciones: OpcionSelector[];
  valorSeleccionado: string | null; // null = ninguna marcada
  alSeleccionar: (valor: string) => void;
  error?: string; // la pantalla lo pasa solo si el campo está tocado
  deshabilitado?: boolean;
};
```

- Chips en fila con `flexWrap: 'wrap'`. Marcado: fondo `primario` y texto `textoSobrePrimario`. Sin marcar: fondo `superficie` y borde `borde`. Radio `radio`.
- Cada chip: `accessibilityRole="button"` y `accessibilityState={{ selected }}` (para el test).
- "Sin cancha" usa el valor `SIN_CANCHA = 'sin-cancha'`; al elegirlo se guarda `null`. "Ganó" / "Perdió" se convierten sin `as`: `valor === 'gano' ? 'gano' : 'perdio'`.

**`VistaError.tsx`** — el código ya está en coding-standards §6. **No existe todavía en el repo**; F05 es la primera feature que lo usa (E2).

**`FormularioPartido.tsx`** — el formulario completo. Va aparte de la pantalla por la regla de los hooks: la pantalla puede regresar `VistaError` antes de llegar a `useFormulario`. Si pasa de ~150 líneas, el marcador se separa en `CamposMarcador` (§6).

```ts
type PropsFormularioPartido = {
  idUsuario: string;
  partido?: Partido; // undefined = crear
  alTerminar: () => void; // navigation.goBack
};
```

---

## Store — `src/stores/useStorePartidos.ts`

F05 lo crea **mínimo**; F06 le agrega `cargando`, `mensajeError`, la carga paginada y la caché.

```ts
type EstadoPartidos = {
  partidos: Partido[]; // la llena F06; F05 solo la lee para editar
  registrarPartido: (idUsuario: string, datos: DatosPartido) => Promise<string | null>;
  actualizarPartido: (idUsuario: string, idPartido: string, datos: DatosPartido) => Promise<string | null>;
  borrarPartido: (idUsuario: string, idPartido: string) => Promise<string | null>;
  limpiar: () => void; // partidos: []
};
```

- Cada acción llama a su servicio (`crearPartido`, `editarPartido`, `eliminarPartido` de D13) en `try/catch`: `console.error` + `obtenerMensajeError` (§10). Devuelve `null` si salió bien o el mensaje si falló.
- **Por qué `string | null` y no `Promise<boolean>` (§8):** el error de guardar solo lo muestra el modal. Si quedara en el `mensajeError` del store, el Historial (F06) mostraría `VistaError` detrás del modal. Es el mismo patrón de `useStoreSesion` (F01).
- F05 **no** actualiza `partidos` después de guardar: F06 recarga desde la primera página (02-data-model, operación 5).
- Los nombres no repiten los del servicio para no chocar en los imports (como `iniciarSesion` / `entrarConCorreo` en F01).

---

## Flujo principal

### A. Crear

1. En Historial toca **[+]** → modal "Nuevo partido" con la fecha de hoy y "Sin cancha" marcado.
2. Llena los campos. Al salir de cada campo, `useFormulario` lo marca como tocado y muestra su error.
3. Toca "Guardar". `useFormulario` marca todo como tocado y llama a `validarPartido(valores, obtenerFechaHoy(new Date()))` (RN09). Si hay errores, se muestran y **no** se llama a Firebase.
4. Si es válido: borra el error del servidor y llama a `registrarPartido(idUsuario, convertirAPartido(valores))`.
5. El servicio llama a `verificarConexion()` y a `addDoc` (RN10: ruta `usuarios/{idUsuario}/partidos`).
6. `null` → `alTerminar()` (cierra el modal). Mensaje → se muestra arriba de "Guardar", el botón se habilita y **lo escrito se conserva**.

### B. Editar

1. En Historial toca un partido → `navigate('FormularioPartido', { idPartido })` (F06).
2. La pantalla, en este orden: si `usuario` es `null` → `VistaCargando` (pasa un instante al cerrar sesión). Si `idPartido` no está en `partidos` → **E2**: `VistaError` "Este partido ya no existe" con botón "Cerrar" (`goBack()`).
3. Si existe, el formulario se llena con `convertirAValores(partido)`.
4. "Guardar" sigue los pasos A.3–A.6, pero con `actualizarPartido(idUsuario, idPartido, datos)` (`updateDoc`).

### C. Eliminar (solo en editar)

1. Toca "Eliminar partido" → `Alert.alert('¿Eliminar este partido?', 'No se puede deshacer.')` con **"Cancelar"** (`style: 'cancel'`) y **"Eliminar"** (`style: 'destructive'`).
2. "Eliminar" → `eliminando = true` (`useState` del formulario) y `borrarPartido(idUsuario, idPartido)`.
3. `null` → `alTerminar()`. Mensaje → arriba de "Guardar" y `eliminando = false`.

### D. Cancelar

"Cancelar" o deslizar hacia abajo cierran el modal y **descartan sin preguntar** (E4 de 01-navigation). Al abrirlo otra vez empieza de cero.

---

## Validaciones

Todas son las de 02-data-model (`src/utilidades/validacionesPartido.ts`, task D12). F05 no agrega reglas.

| Campo | Función | Regla |
|---|---|---|
| Fecha | `validarFecha` | RN09: obligatoria, `AAAA-MM-DD`, día real, hoy o antes |
| Cancha | `validarCancha` | RN09 (opcional) y RN05 (si viene, está en el catálogo) |
| Resultado | `validarResultado` | RN09 |
| Puntos, rebotes, asistencias | `validarEstadistica` | RN09, RN08: enteros de 0 a 100 |
| Marcador | `validarMarcador` | RN09: los dos o ninguno, 0–200, sin empate, coherente con el resultado y ≥ puntos |

Después de validar: `convertirAPartido`. Para editar: `convertirAValores`.

---

## Casos de error

Permisos de ubicación y cámara **no aplican** (F05 no los usa). Tampoco hay listas vacías: el catálogo de canchas es fijo (RN05).

| ID | Situación | Comportamiento esperado |
|---|---|---|
| E1 | "Guardar" con campos obligatorios vacíos | Cada campo muestra su mensaje ("Indica si ganaste o perdiste", "Escribe tus puntos"…). No se llama a Firebase |
| E2 | Formato malo (`'4.5'`, `'101'`, `'2026-02-30'`, fecha futura, marcador incoherente) | Mensaje de 02-data-model al salir del campo o al enviar |
| E3 | **Sin internet** al guardar o eliminar (RN11) | `'sin-conexion'` antes de Firebase → "No hay conexión. Revisa tu internet e intenta de nuevo." arriba de "Guardar", en menos de 2 s. El botón se habilita y lo escrito se conserva (E1 y CAD13 de 02-data-model; E8 de 01-navigation) |
| E4 | **Firebase falla** (`unavailable`, `deadline-exceeded`, `permission-denied`) | Mensaje de la tabla *Errores* arriba de "Guardar". Lo escrito se conserva; se puede volver a tocar "Guardar" |
| E5 | **Partido inexistente** al abrir "Editar" (borrado en otro teléfono, ajeno o lista aún vacía) | `VistaError` "Este partido ya no existe" + "Cerrar" (E2 de 01-navigation). No se muestra el formulario vacío |
| E6 | Lo borraron **mientras** se editaba | `updateDoc` lanza `not-found` → "Este partido ya no existe." arriba de "Guardar" (E12 de 02-data-model). El usuario cierra con "Cancelar" |
| E7 | Eliminar uno que ya no existe | `deleteDoc` no falla → el modal se cierra (E13 de 02-data-model) |
| E8 | Doble toque en "Guardar" o en "Eliminar" de la alerta | Botón y campos deshabilitados mientras se envía: un solo partido (E10 de 02-data-model) |
| E9 | Partido con `idCancha` que ya no está en el catálogo | Ningún chip marcado; al guardar, "Elige una cancha de la lista" (E16 de 02-data-model) |
| E10 | Se cierra la sesión con el modal abierto | El modal desaparece (E5 de 01-navigation). Lo no guardado se pierde |

---

## Resultado esperado

El jugador registra, edita y elimina sus partidos desde un modal con validación clara, sin crear duplicados, y con mensajes en español cuando no hay internet o Firebase falla. Los datos en Firestore cumplen RN09 y RN10.

---

## Criterios de aceptación

Probados en el iPhone con Expo Go, en la consola de Firebase y con Jest. Los marcados *(después de F06)* necesitan la lista real del Historial.

**Crear**

- [ ] F05-CA01 — [+] abre "Nuevo partido" con la fecha de hoy, "Sin cancha" marcado, ningún resultado y lo demás vacío.
- [ ] F05-CA02 — "Guardar" sin llenar nada muestra "Indica si ganaste o perdiste", "Escribe tus puntos", "Escribe tus rebotes" y "Escribe tus asistencias". En Firestore no aparece nada.
- [ ] F05-CA03 — Al salir del campo: puntos `4.5` → "Usa solo números enteros"; `101` → "Máximo 100"; fecha `2026-02-30` → "Fecha no válida"; la fecha de mañana → "La fecha no puede ser futura". Antes de salir no hay error.
- [ ] F05-CA04 — Marcador: solo "Tu equipo" lleno → "Escribe los dos marcadores o deja ambos vacíos" (una sola vez, debajo de los dos). "Ganó" con 15–20 → "Si ganaste, tu marcador debe ser mayor". Puntos 25 con 21–17 → "Tus puntos no pueden ser más que los de tu equipo".
- [ ] F05-CA05 — Con datos válidos y Sullivan marcada, el modal se cierra y en `usuarios/{mi uid}/partidos` aparece un documento con los 8 campos: números enteros, `idCancha: 'sullivan'` y marcador `null` si lo dejé vacío (CAD10).
- [ ] F05-CA06 — Doble toque rápido en "Guardar" crea **un solo** documento; mientras guarda, el botón muestra el indicador y los campos no se pueden editar.

**Editar y eliminar**

- [ ] F05-CA07 — "Editar partido de prueba" (provisional de N7) muestra "Este partido ya no existe" y "Cerrar" regresa al Historial (CA20 de 01-navigation).
- [ ] F05-CA08 — *(después de F06)* Tocar un partido abre "Editar partido" con sus datos. Cambiar los puntos y guardar actualiza el **mismo** documento en la consola.
- [ ] F05-CA09 — *(después de F06)* Con el modal abierto, borro el partido en la consola y toco "Guardar" → "Este partido ya no existe." (CAD12).
- [ ] F05-CA10 — *(después de F06)* "Eliminar partido" muestra la alerta. "Cancelar" no hace nada; "Eliminar" cierra el modal y el documento ya no está en la consola. En "Nuevo partido" no aparece "Eliminar partido".

**Sin internet y cancelar**

- [ ] F05-CA11 — En modo avión, "Guardar" con datos válidos muestra "No hay conexión. Revisa tu internet e intenta de nuevo." en menos de 2 s; el botón se habilita y lo escrito sigue ahí (CAD13). *(Después de F06)* lo mismo con "Eliminar".
- [ ] F05-CA12 — Escribo datos y toco "Cancelar" (o deslizo hacia abajo): el modal se cierra sin preguntar y, al abrir [+] otra vez, el formulario está como en F05-CA01.

**Pruebas (Jest)**

- [ ] F05-CA13 — **Integración — `PantallaFormularioPartido`** (`src/pantallas/PantallaFormularioPartido.test.tsx`). Se dibuja `NavegadorRaiz` con `usuario` de prueba y `revisandoSesion: false`. `servicioSesion` simulado como en N9; `servicioPartidos` simulado con fábrica (`crearPartido`, `editarPartido`, `eliminarPartido`), y `crearPartido` rechaza con `new Error('sin-conexion')`. El test toca la tab "Historial" y el [+] (por su `accessibilityLabel`), y luego:
  1. "Guardar" con todo vacío → aparece "Indica si ganaste o perdiste" y `crearPartido` **no** se llamó.
  2. Escribe puntos `12`, rebotes `5`, asistencias `3`, toca "Ganó" y "Guardar" → aparece "No hay conexión. Revisa tu internet e intenta de nuevo." y `crearPartido` se llamó con el uid y `puntos: 12` (número), `idCancha: null`, `marcadorPropio: null`.

  `render` y `fireEvent` llevan `await` (Testing Library v14).

**Código**

- [ ] F05-CA14 — `npx tsc --noEmit`, `npx expo lint` y `npx jest` pasan. No hay `any`, `as any` ni `console.log` en los archivos de F05. `PantallaFormularioPartido` y `FormularioPartido` no importan `servicioPartidos` (solo el store, §4).

---

## Tasks

Cada task ≈ un commit.

- ➡️ **D12 de 02-data-model** — validaciones y conversiones de partido + pruebas (CAD17–CAD21).
- ➡️ **D13 de 02-data-model** — `servicioPartidos`: `crearPartido`, `editarPartido`, `eliminarPartido`. CAD10 se prueba en F05.4 y CAD12 después de F06.
- [ ] **F05.1 — Crear `useStorePartidos`** mínimo: `partidos`, `registrarPartido`, `actualizarPartido`, `borrarPartido` y `limpiar`.
- [ ] **F05.2 — Crear `VistaError`** con el código de coding-standards §6.
- [ ] **F05.3 — Crear `SelectorOpciones`** (chips, marcado, error, deshabilitado y accesibilidad).
- [ ] **F05.4 — Crear `FormularioPartido` y usarlo en `PantallaFormularioPartido` en modo crear**: campos, chips, marcador, error del servidor y "Guardar". Quita el texto provisional de N4. Probar F05-CA01–CA06, CA11 y CA12.
- [ ] **F05.5 — Modo editar** en `PantallaFormularioPartido`: `VistaCargando` sin usuario, E2 con `VistaError`, valores con `convertirAValores` y guardar con `actualizarPartido`. Probar F05-CA07.
- [ ] **F05.6 — Eliminar**: botón "Eliminar partido" solo en editar, alerta de confirmación y `borrarPartido`.
- [ ] **F05.7 — Test de integración** (F05-CA13). Incluye agregar `accessibilityLabel="Nuevo partido"` al [+] de `PantallaHistorial`, para que el test lo encuentre (también lo lee VoiceOver).
- [ ] **F05.8 — Probar en el iPhone** F05-CA01–CA07, CA11 y CA12. CA08–CA10 se marcan después de F06.

**No se quita ningún botón provisional de N7:** "Editar partido de prueba" sirve para probar E2 (F05-CA07). F06 quita los dos cuando ponga la lista real.

---

## Diferencias con lo visto en clase (para la defensa)

| En clase | En HoopsMap | Por qué |
|---|---|---|
| Selector con `Picker` o selector de fecha nativo | Chips (`SelectorOpciones`) y fecha como texto prellenado con hoy | Sin dependencias nuevas; `validarFecha` ya revisa formato, día real y fecha futura |
| La acción de guardar devuelve `boolean` (coding-standards §8) | Devuelve `string \| null` | El error solo lo muestra el modal; así no aparece en el Historial (mismo patrón que F01) |
| Sin internet se deshabilita el botón | El botón sigue activo y muestra "No hay conexión…" | Lo define 02-data-model (bloquear con mensaje, CAD13); no hace falta NetInfo en la pantalla |

---

## Decisiones resueltas

- **Store:** F05 crea `useStorePartidos` mínimo; F06 lo amplía. Las acciones devuelven `string | null`.
- **Cancha y resultado:** chips con `SelectorOpciones`.
- **Fecha:** `CampoTexto` `AAAA-MM-DD`, prellenado con hoy al crear.
- **Eliminar:** `Alert.alert` con "Cancelar" y "Eliminar" (destructive). Solo en modo editar.
- **Sin internet:** se muestra el error; no se deshabilita nada.
- **Provisionales de N7:** F05 no quita ninguno.
- **Test de integración:** F05 aporta el 3.º de 4.

---