# F01 — Registro, inicio y cierre de sesión

> **Estado:** v1.0 · **Última actualización:** 2026-11-05
> **Depende de:** `specs/00-project.md` (RN01, RN04, RN11, *Cumplimiento de la rúbrica*), `specs/01-navigation.md` (*Decisión de sesión*, *Al cerrar sesión*, N8, N9), `specs/02-data-model.md` (Usuario, D2, D7, D8, D9, *Errores*, E15) y `docs/coding-standards.md` (§4, §6, §8, §10, §11, §12)
> **Clases de referencia:** [Validación de Formularios](https://academy.alvesc.com/clase/validacion-formularios) · [Custom Hook de Formulario](https://academy.alvesc.com/clase/custom-hook-formulario) · [TextInput y Teclado](https://academy.alvesc.com/clase/textinput-teclado) · [Autenticación y Seguridad](https://academy.alvesc.com/clase/autenticacion-y-seguridad) · [Persistencia Local y Almacenamiento Seguro](https://academy.alvesc.com/clase/persistencia-y-almacenamiento-seguro)

---

## Objetivo

Permitir que el jugador **cree una cuenta** (nombre, correo y contraseña), **inicie sesión**, **siga con la sesión abierta** al cerrar y volver a abrir la app, y **cierre sesión de verdad**: termina su check-in (RN04), se borra la caché del historial (RN11) y se limpian los stores.

Esta feature también deja listas las piezas que usan los demás formularios: `useFormulario`, `CampoTexto` y `BotonPrincipal`.

**Requisitos de la rúbrica que cubre:**

| Requisito | Cómo |
|---|---|
| Autenticación | Registro, inicio de sesión, sesión persistente y cerrar sesión con Firebase Auth |
| Formularios validados (2 de 3) | Registro e inicio de sesión (el tercero es el de partido, F05) |
| Persistencia local | La sesión la guarda Firebase en AsyncStorage (configurado en D2) |
| State management | `useStoreSesion` con Zustand |
| Testing | Pruebas unitarias de validaciones y errores, y **1 test de integración** (`PantallaInicioSesion`) |

---

## Actor

- **Jugador sin sesión:** crea su cuenta o inicia sesión.
- **Jugador con sesión:** ve su nombre y correo en Perfil y cierra sesión.
- **Firebase Auth (servidor):** guarda la cuenta (la contraseña como hash, nunca en texto plano), revisa las credenciales y recuerda la sesión.

---

## Precondiciones

- **D1:** proyecto de Firebase con el proveedor correo/contraseña activado.
- **D2:** `src/servicios/firebase.ts` ya existe con `initializeAuth` y persistencia en AsyncStorage. **F01 lo usa; no lo vuelve a crear.**
- **D7:** existe `obtenerMensajeError` en `src/utilidades/errores.ts`.
- **D8:** existe `verificarConexion` en `src/servicios/servicioConexion.ts`.
- **D9:** existe `validarNombre` en `src/utilidades/validacionesUsuario.ts`.
- **N1–N7:** navegación base con las pantallas provisionales `PantallaInicioSesion`, `PantallaRegistro` y `PantallaPerfil`.
- Para el test de integración: **D6** (Jest configurado).

---

## Datos de entrada

| Dato | Pantalla | Obligatorio | Se limpia con `trim()` | ¿Se guarda? |
|---|---|---|---|---|
| Nombre | Registro | Sí | Sí | Sí, en `displayName` de Firebase Auth (02-data-model) |
| Correo | Registro e Inicio de sesión | Sí | Sí | Sí, en Firebase Auth |
| Contraseña | Registro e Inicio de sesión | Sí | **No** (un espacio puede ser parte de ella) | **Nunca** en la app; Firebase guarda su hash |
| Sesión guardada | Al abrir la app | — | — | AsyncStorage, la escribe Firebase solo (D2) |
| Confirmación de la alerta | Perfil | — | — | No |

### Tipos del formulario — `src/tipos/usuario.ts`

Se agregan junto a `Usuario`. Igual que en el formulario de partido, todo lo que escribe el usuario es texto.

```ts
export type ValoresRegistro = {
  nombre: string;
  correo: string;
  contrasena: string;
};

export type ValoresInicioSesion = {
  correo: string;
  contrasena: string;
};

// Un mensaje por campo con error; si el campo no aparece, está bien (mismo patrón que ErroresPartido)
export type ErroresRegistro = Partial<Record<keyof ValoresRegistro, string>>;
export type ErroresInicioSesion = Partial<Record<keyof ValoresInicioSesion, string>>;
```

---

## Diseño de las pantallas

Todas usan colores, tipografía y espaciado de `tema.ts` (01-navigation, *Paleta y tipografía*).

### Estructura común de Inicio de sesión y Registro

- `KeyboardAvoidingView` con `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`, como en la clase *TextInput y Teclado*.
- Adentro, `TouchableWithoutFeedback` con `onPress={Keyboard.dismiss}`: **tocar fuera de los campos cierra el teclado**.
- Arriba, el título **"HoopsMap"** con `tipografia.titulo` en `colores.texto`. El header de la navegación sigue mostrando "Iniciar sesión" o "Crear cuenta".
- Cada campo es un `CampoTexto`: **etiqueta visible arriba** y *placeholder* dentro.
- **Error del servidor** (credenciales, sin internet, etc.): texto en `colores.error` con `tipografia.pequeno`, **arriba del botón**. Solo aparece si hay error.
- `BotonPrincipal` deshabilitado y con indicador de carga mientras `enviando` es `true`.

### Pantalla "Iniciar sesión" (`PantallaInicioSesion`)

| Orden | Elemento | Detalle |
|---|---|---|
| 1 | Título | "HoopsMap" |
| 2 | Campo "Correo" | Placeholder "tu@correo.com" · `keyboardType="email-address"` · `autoCapitalize="none"` · `autoCorrect={false}` |
| 3 | Campo "Contraseña" | Placeholder "Tu contraseña" · `secureTextEntry` |
| 4 | Error del servidor | Solo si hay |
| 5 | Botón "Iniciar sesión" | `BotonPrincipal` |
| 6 | Enlace "Crear cuenta" | Texto en `colores.primario` → `navigate('Registro')` (01-navigation) |

### Pantalla "Crear cuenta" (`PantallaRegistro`)

| Orden | Elemento | Detalle |
|---|---|---|
| 1 | Título | "HoopsMap" |
| 2 | Campo "Nombre" | Placeholder "Tu nombre" · `autoCapitalize="words"` |
| 3 | Campo "Correo" | Igual que en Inicio de sesión |
| 4 | Campo "Contraseña" | Placeholder "Mínimo 6 caracteres y un número" · `secureTextEntry` |
| 5 | Error del servidor | Solo si hay |
| 6 | Botón "Crear cuenta" | `BotonPrincipal` |
| 7 | Enlace "Ya tengo cuenta" | Texto en `colores.primario` → `goBack()` (01-navigation) |

**No** hay campo "Confirmar contraseña" (ver *Diferencias con lo visto en clase*). **No** se pasa de un campo al siguiente con el botón del teclado (decisión del MVP).

### Pantalla "Mi perfil" (`PantallaPerfil`) — la parte de F01

| Orden | Elemento | Detalle |
|---|---|---|
| 1 | Nombre | `obtenerNombreVisible(usuario.nombre)` con `tipografia.subtitulo` (muestra "Jugador" si está vacío, E15 de 02-data-model) |
| 2 | Correo | `tipografia.cuerpo` en `colores.textoSecundario` |
| — | *(Promedios)* | Los agrega F06 entre el correo y el botón |
| 3 | Botón "Cerrar sesión" | `BotonPrincipal`. Deshabilitado y con indicador mientras `cerrandoSesion` es `true` |

### Componentes nuevos — `src/componentes/`

Se crean aquí porque F01 tiene el primer formulario (coding-standards §6). F05 los reutiliza.

**`CampoTexto.tsx`**

```ts
type PropsCampoTexto = {
  etiqueta: string; // texto visible arriba del campo
  valor: string;
  alCambiarTexto: (texto: string) => void;
  alSalir: () => void; // onBlur: marca el campo como tocado
  error?: string; // la pantalla lo pasa solo si el campo está tocado
  placeholder?: string;
  deshabilitado?: boolean; // editable={!deshabilitado}
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  autoCorrect?: boolean;
  secureTextEntry?: boolean;
};
```

- **Etiqueta:** `tipografia.pequeno` en `colores.texto`.
- **Campo:** fondo `colores.superficie`, borde de 1 en `colores.borde`, `radio`, texto `tipografia.cuerpo`. Si hay `error`, el borde cambia a `colores.error` (estilo condicional de la clase *Validación de Formularios*).
- **Mensaje de error:** debajo del campo, `tipografia.pequeno` en `colores.error`.

**`BotonPrincipal.tsx`**

```ts
type PropsBotonPrincipal = {
  texto: string;
  alPresionar: () => void;
  deshabilitado?: boolean;
  cargando?: boolean; // muestra ActivityIndicator en lugar del texto y deshabilita el botón
};
```

- Fondo `colores.primario` y texto `colores.textoSobrePrimario`, `radio`.
- Deshabilitado (o cargando): fondo `colores.inactivo`.
- `accessibilityRole="button"`, para que el test pueda encontrarlo como botón aunque el header tenga el mismo texto.

---

## Flujo principal

### A. Abrir la app (sesión persistente)

1. `NavegadorRaiz` llama a `escucharSesion()` del store dentro de un `useEffect`. Al desmontarse, deja de escuchar.
2. Mientras Firebase lee la sesión guardada en AsyncStorage, `revisandoSesion` es `true` y se ve `VistaCargando` (01-navigation).
3. Firebase responde con un usuario (o ninguno). El store guarda `usuario` y pone `revisandoSesion` en `false`.
4. La navegación muestra el grupo con sesión (tab Mapa) o el grupo sin sesión ("Iniciar sesión"). **Sin `navigate`** (01-navigation, *Decisión de sesión*).

**Escuchar la sesión no llama a `verificarConexion()`**: la app debe abrir sin internet con la sesión guardada (CA21 de 01-navigation).

### B. Crear cuenta

1. En "Iniciar sesión", el usuario toca "Crear cuenta" → se abre "Crear cuenta".
2. Escribe nombre, correo y contraseña. Al salir de cada campo, `useFormulario` lo marca como tocado y muestra su error si lo hay.
3. Toca "Crear cuenta". `useFormulario` marca todos los campos como tocados y llama a `validarRegistro`. Si hay errores, se muestran y **no** se llama a Firebase.
4. Si todo es válido: `enviando = true` (botón deshabilitado con indicador) y se borra el error del servidor anterior.
5. La pantalla llama a `registrarse(valores)` del store, que llama a `crearCuenta(nombre.trim(), correo.trim(), contrasena)` del servicio:
   1. `verificarConexion()`.
   2. `createUserWithEmailAndPassword`. Aquí **Firebase ya inicia la sesión solo**.
   3. `updateProfile` con `displayName = nombre`.
6. Firebase avisa del nuevo usuario y la app pasa sola a la tab **Mapa** (sin `navigate`, sin regresar al login).
7. Cuando `crearCuenta` termina, el store guarda el usuario **con su nombre** (E15 de 02-data-model: Firebase avisa antes de que termine `updateProfile`).

### C. Iniciar sesión

1. Escribe correo y contraseña y toca "Iniciar sesión".
2. `useFormulario` valida con `validarInicioSesion`. Si hay errores, se muestran y **no** se llama a Firebase.
3. Si es válido: `enviando = true` y se borra el error del servidor anterior.
4. `iniciarSesion(valores)` del store → `entrarConCorreo(correo.trim(), contrasena)` del servicio: `verificarConexion()` y `signInWithEmailAndPassword`.
5. Firebase avisa del usuario y la app pasa sola a la tab **Mapa**.
6. Si falla, la acción devuelve el mensaje en español y la pantalla lo muestra arriba del botón. `enviando` vuelve a `false`.

### D. Cerrar sesión

1. En Perfil, toca "Cerrar sesión".
2. `Alert.alert` con **"¿Seguro que quieres cerrar sesión?"** y dos botones (01-navigation):
   - **"Cancelar"** (`style: 'cancel'`): no pasa nada, sigue en Perfil con sesión.
   - **"Cerrar sesión"** (`style: 'destructive'`): llama a `cerrarSesion()` del store.
3. `cerrarSesion()` pone `cerrandoSesion = true` (botón deshabilitado con indicador) y hace, **en este orden**:
   1. **Terminar el check-in** (RN04) *(task F01.16, después de D11)*: llama **siempre** a `terminarCheckIn(idUsuario)`, sin revisar antes si hay uno activo (borrar un documento que no existe no da error, E7 de 02-data-model). Va **antes** de `signOut` porque las reglas de Firestore necesitan la sesión. Si falla (por ejemplo, sin internet): `console.error` y **se sigue**; el check-in vence solo a los 90 min (RN01).
   2. **Cerrar la sesión de Firebase:** `salirDeFirebase()` (`signOut`). **No** llama a `verificarConexion()`, porque cerrar sesión debe funcionar sin internet (02-data-model).
   3. **Borrar la caché del historial** (RN11) *(task F01.17, después de D16)*: `borrarCacheHistorial()`. Si falla: `console.error` y se sigue (la caché guarda `idUsuario`, así que el siguiente usuario igual no la vería; E5 de 02-data-model).
   4. **Limpiar los stores** *(task F01.18, después de los stores de F03 y F06)*: `limpiar()` del store de check-ins y del de partidos, y al final `limpiar()` de `useStoreSesion`.
4. Firebase avisa que ya no hay usuario → se muestra "Iniciar sesión" y desaparecen todas las pantallas con sesión, incluido cualquier modal (01-navigation).

Mientras no existan D11, D16 y los stores de F03 y F06, `cerrarSesion` hace solo los pasos 2 y "limpiar `useStoreSesion`".

---

## Servicio — `src/servicios/servicioSesion.ts`

Único archivo de F01 que importa `firebase/auth`. Usa la instancia `auth` de `firebase.ts` (D2).

| Función | Recibe | Devuelve | Firebase | ¿`verificarConexion()`? |
|---|---|---|---|---|
| `crearCuenta` | `nombre`, `correo`, `contrasena` (ya limpios) | `Promise<Usuario>` | `createUserWithEmailAndPassword` + `updateProfile({ displayName: nombre })` | **Sí** |
| `entrarConCorreo` | `correo`, `contrasena` | `Promise<void>` | `signInWithEmailAndPassword` | **Sí** |
| `salirDeFirebase` | — | `Promise<void>` | `signOut` | **No** (debe funcionar sin internet) |
| `escucharCambiosDeSesion` | `alCambiar: (usuario: Usuario \| null) => void` | `() => void` (función para dejar de escuchar) | `onAuthStateChanged` | **No** (la app abre sin internet) |
| `convertirUsuario` | `User` de Firebase | `Usuario` | — | — |

- **`crearCuenta`:** si `createUserWithEmailAndPassword` falla, lanza el error (no se creó nada). Si la cuenta se crea pero `updateProfile` falla, **la cuenta ya existe**: registra con `console.error` y devuelve el usuario con `nombre: ''` (E15 de 02-data-model). No lanza el error, porque el usuario sí quedó registrado.
- **`entrarConCorreo`** devuelve `void`: el usuario lo entrega `escucharCambiosDeSesion`.
- **`convertirUsuario`:** `uid` → `idUsuario`; `email ?? ''` → `correo`; `displayName ?? ''` → `nombre` (Firebase los tipa como "texto o null").
- Todas llevan JSDoc corto (coding-standards §13).

---

## Store — `src/stores/useStoreSesion.ts`

```ts
type EstadoSesion = {
  usuario: Usuario | null;
  revisandoSesion: boolean; // true al abrir la app hasta la primera respuesta de Firebase (hace de "cargando")
  cerrandoSesion: boolean; // deshabilita el botón de Perfil
  escucharSesion: () => () => void; // devuelve la función para dejar de escuchar
  registrarse: (valores: ValoresRegistro) => Promise<string | null>; // null = salió bien; texto = mensaje de error
  iniciarSesion: (valores: ValoresInicioSesion) => Promise<string | null>;
  cerrarSesion: () => Promise<string | null>;
  limpiar: () => void;
};
```

- **Estado inicial:** `usuario: null`, `revisandoSesion: true`, `cerrandoSesion: false`.
- **`limpiar()`:** deja `usuario: null`, `cerrandoSesion: false` y `revisandoSesion: false`. **No** regresa `revisandoSesion` a `true`: la escucha de la sesión sigue activa y Firebase ya avisó que no hay usuario, así que la app se quedaría en `VistaCargando` para siempre.
- **¿Por qué las acciones devuelven el mensaje en lugar de guardarlo en el store?** El error del servidor solo lo muestra la pantalla que hizo la petición. Si se guardara en el store, el error del inicio de sesión aparecería también en "Crear cuenta". Por la regla de coding-standards §8 ("`useState` si el dato solo lo usa una pantalla"), cada pantalla lo guarda en su propio `useState<string | null>(null)`.
- Cada acción usa `try/catch`: `console.error` con el detalle y `obtenerMensajeError(error)` para el usuario (coding-standards §10).
- **`registrarse`:** al terminar `crearCuenta`, hace `set({ usuario })` con el usuario que devuelve (ya trae el nombre, E15).
- **`iniciarSesion`:** no hace `set`; el usuario llega por `escucharSesion`.
- **`cerrarSesion`:** sigue el orden de *Flujo principal D*. Si `salirDeFirebase` falla, pone `cerrandoSesion = false`, **no** limpia nada y devuelve el mensaje. La pantalla lo muestra con `Alert.alert(mensaje)`.
- **Excepción de capas** (propuesta para coding-standards §4): **solo** `cerrarSesion` de `useStoreSesion` puede llamar a `limpiar()` de otros stores, con `useStoreX.getState().limpiar()`. Los otros stores **nunca** importan `useStoreSesion`: reciben `idUsuario` como parámetro en sus acciones.

---

## Validaciones

Funciones **puras** en `src/utilidades/validacionesUsuario.ts`, junto a `validarNombre` (D9). Devuelven el mensaje o `null`.

| Función | Regla | Mensajes |
|---|---|---|
| `validarNombre(nombre)` | Ya definida en 02-data-model (D9): obligatorio, de 2 a 30 caracteres después de `trim()` | "Escribe tu nombre" · "Mínimo 2 caracteres" · "Máximo 30 caracteres" |
| `validarCorreo(correo)` | Obligatorio después de `trim()`. Formato con la regex de la clase: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | "Escribe tu correo" · "Correo no válido" |
| `validarContrasena(contrasena)` | **Solo registro.** Sin `trim()`. Obligatoria, mínimo `CONTRASENA_LONGITUD_MINIMA` (6) caracteres y al menos un número (`/[0-9]/`) | "Escribe tu contraseña" · "Mínimo 6 caracteres" · "Incluye al menos un número" |
| `validarRegistro(valores)` | Llama a `validarNombre`, `validarCorreo` y `validarContrasena` y junta los mensajes en `ErroresRegistro` | — |
| `validarInicioSesion(valores)` | `validarCorreo` + contraseña **solo obligatoria** (sin longitud ni número), y junta los mensajes en `ErroresInicioSesion` | "Escribe tu contraseña" |

- **¿Por qué en inicio de sesión la contraseña solo es obligatoria?** No tiene caso decirle "te falta un número" a alguien que ya tiene cuenta: Firebase decide si la contraseña es correcta.
- **Mínimo 6:** es también el mínimo que exige Firebase, así que la app y el servidor piden lo mismo.
- **Constante nueva** en `src/constantes/configuracion.ts`: `export const CONTRASENA_LONGITUD_MINIMA = 6; // F01 (igual al mínimo de Firebase)`.

**Nombre que se muestra** — `src/utilidades/usuario.ts`:

| Función | Qué hace | Ejemplo |
|---|---|---|
| `obtenerNombreVisible(nombre: string): string` | Devuelve el nombre, o "Jugador" si está vacío (E15 de 02-data-model). La reutiliza F07 | `''` → `'Jugador'` · `'Ana'` → `'Ana'` |

### Cómo se usan con `useFormulario`

- `useFormulario` (`src/hooks/useFormulario.ts`) se crea en esta feature, tal como lo describe coding-standards §11.
- El error de un campo se muestra **solo si está tocado** (como en clase).
- El botón se deshabilita con `enviando`: un doble toque no crea dos cuentas ni hace dos peticiones.
- `alEnviar` borra el error del servidor, llama a la acción del store y, si devuelve un mensaje, lo guarda en el `useState` de la pantalla.

```tsx
// Esqueleto ilustrativo de PantallaInicioSesion (el código final se hace en Claude Code)
const [errorServidor, setErrorServidor] = useState<string | null>(null);
const iniciarSesion = useStoreSesion((estado) => estado.iniciarSesion);

const formulario = useFormulario<ValoresInicioSesion>({
  valoresIniciales: { correo: '', contrasena: '' },
  validar: validarInicioSesion,
  alEnviar: async (valores) => {
    setErrorServidor(null);
    const mensaje = await iniciarSesion(valores);
    setErrorServidor(mensaje); // null si entró: la navegación cambia sola
  },
});
```

---

## Errores de Firebase Auth

Se agregan a `obtenerMensajeError` de `src/utilidades/errores.ts`, para que **todos** los errores se traduzcan en un solo lugar. Se leen igual que los de Firestore: `error instanceof FirebaseError` y `error.code`.

| Código | Mensaje |
|---|---|
| `auth/invalid-credential` | "Correo o contraseña incorrectos." |
| `auth/email-already-in-use` | "Ya existe una cuenta con este correo." |
| `auth/invalid-email` | "Correo no válido." |
| `auth/weak-password` | "La contraseña es muy débil." |
| `auth/too-many-requests` | "Demasiados intentos. Espera unos minutos e intenta de nuevo." |
| `auth/network-request-failed` | "No hay conexión. Revisa tu internet e intenta de nuevo." (el mismo de `'sin-conexion'`) |
| Cualquier otro `auth/...` | "Algo salió mal. Intenta de nuevo." (el genérico que ya existe) |

**Por qué un solo mensaje para "contraseña incorrecta" y "correo no registrado":** las versiones actuales de Firebase devuelven `auth/invalid-credential` en los dos casos. Así no se revela si un correo tiene cuenta.

---

## Casos de error y casos límite

Los permisos de ubicación y cámara y las listas vacías **no aplican** a F01: ninguna de sus pantallas los usa.

| ID | Situación | Comportamiento esperado |
|---|---|---|
| E1 | Tocar "Iniciar sesión" o "Crear cuenta" con campos vacíos | Todos los campos se marcan como tocados y cada uno muestra su mensaje ("Escribe tu…"). **No** se llama a Firebase |
| E2 | Correo sin formato válido (`ana@correo`) | "Correo no válido" al salir del campo o al enviar |
| E3 | En registro, contraseña corta o sin número | "Mínimo 6 caracteres" o "Incluye al menos un número" |
| E4 | En registro, nombre vacío, de 1 carácter o de más de 30 | Mensajes de `validarNombre` (D9) |
| E5 | **Sin internet** al registrarse o iniciar sesión | `verificarConexion` lanza `'sin-conexion'` **antes** de llamar a Firebase. Arriba del botón: "No hay conexión. Revisa tu internet e intenta de nuevo." El botón se vuelve a habilitar. Sin spinner eterno |
| E6 | Contraseña incorrecta o correo sin cuenta | "Correo o contraseña incorrectos." arriba del botón |
| E7 | Registro con un correo que ya tiene cuenta | "Ya existe una cuenta con este correo." |
| E8 | Muchos intentos fallidos seguidos | "Demasiados intentos. Espera unos minutos e intenta de nuevo." |
| E9 | Firebase falla con otro error | "Algo salió mal. Intenta de nuevo." El detalle va a `console.error` |
| E10 | **Doble toque** en "Crear cuenta" o "Iniciar sesión" | El botón se deshabilita con `enviando`: una sola petición, una sola cuenta |
| E11 | La cuenta se crea pero `updateProfile` falla (E15 de 02-data-model) | La app pasa a Mapa igual. Perfil muestra "Jugador" |
| E12 | Abrir la app **sin internet** con sesión guardada | Se ve Mapa (CA21 de 01-navigation). Escuchar la sesión no llama a `verificarConexion` |
| E13 | Abrir la app sin internet y sin sesión | Se ve "Iniciar sesión". Al intentar entrar → E5 |
| E14 | **Cerrar sesión sin internet** | `terminarCheckIn` falla con `'sin-conexion'` → `console.error` y se sigue. `signOut` funciona sin internet → se ve "Iniciar sesión". Si había check-in, vence solo a los 90 min (RN01, RN04) |
| E15 | `signOut` falla (muy raro) | `Alert.alert` con el mensaje traducido. Sigue en Perfil con sesión; el botón se vuelve a habilitar; no se borra nada |
| E16 | Doble toque en "Cerrar sesión" de la alerta | El botón de Perfil está deshabilitado mientras `cerrandoSesion` es `true` |
| E17 | Error en "Iniciar sesión", luego ir a "Crear cuenta" | "Crear cuenta" **no** muestra ese error: cada pantalla guarda el suyo en su `useState` |
| E18 | Correo con espacios al inicio o al final | Se limpia con `trim()` antes de validar y de enviar. Entra normal |
| E19 | La sesión termina con un modal abierto (cerró sesión, o Firebase invalidó la cuenta desde la consola) | Firebase avisa `null` cuando lo detecta → el modal desaparece y se ve "Iniciar sesión" (E5 de 01-navigation) |
| E20 | Firebase tarda en revisar la sesión al abrir | Se mantiene `VistaCargando`; no hay "parpadeo" del login (E12 de 01-navigation) |

---

## Resultado esperado

- El jugador puede crear su cuenta con nombre, correo y contraseña, y la app lo lleva sola al Mapa.
- Puede iniciar sesión, cerrar la app y volver a abrirla sin tener que entrar de nuevo, incluso sin internet.
- Al cerrar sesión, después de confirmar, termina su check-in, se borra la caché y se limpian los stores (cuando existan D11, D16 y los stores de F03 y F06).
- Todos los errores se muestran en español, en el lugar acordado, sin pantallas en blanco ni spinners eternos.
- `useFormulario`, `CampoTexto` y `BotonPrincipal` quedan listos para el formulario de partido (F05).

---

## Criterios de aceptación

Probados en el iPhone con Expo Go, en la consola de Firebase y con Jest, según diga cada uno.

**Registro**

- [ ] F01-CA01 — En "Crear cuenta", tocar el botón con todo vacío muestra "Escribe tu nombre", "Escribe tu correo" y "Escribe tu contraseña" debajo de cada campo, con el borde en rojo. En la consola de Firebase (Authentication) no aparece ninguna cuenta nueva.
- [ ] F01-CA02 — Escribir `ana@correo` en Correo y salir del campo muestra "Correo no válido". Antes de salir del campo no se ve ningún error.
- [ ] F01-CA03 — En registro, la contraseña `abc12` muestra "Mínimo 6 caracteres" y `abcdef` muestra "Incluye al menos un número".
- [ ] F01-CA04 — Con datos válidos, al tocar "Crear cuenta" la app pasa **sola** a la tab Mapa, sin tocar nada más. En la consola de Firebase aparece el correo nuevo.
- [ ] F01-CA05 — Después de registrarme, Perfil muestra el nombre que escribí (sin espacios de más) y mi correo.
- [ ] F01-CA06 — Registrarme con un correo que ya tiene cuenta muestra "Ya existe una cuenta con este correo." arriba del botón.
- [ ] F01-CA07 — Tocar dos veces muy rápido "Crear cuenta" crea **una sola** cuenta. Mientras se envía, el botón se ve deshabilitado con indicador de carga.
- [ ] F01-CA08 — Con el teclado abierto, tocar fuera de los campos cierra el teclado. El campo Correo no pone mayúscula inicial ni autocorrige.

**Inicio de sesión**

- [ ] F01-CA09 — Tocar "Iniciar sesión" con todo vacío muestra "Escribe tu correo" y "Escribe tu contraseña".
- [ ] F01-CA10 — Con una contraseña de 3 caracteres **no** aparece "Mínimo 6 caracteres": se intenta entrar y aparece "Correo o contraseña incorrectos.".
- [ ] F01-CA11 — Con contraseña incorrecta aparece "Correo o contraseña incorrectos." arriba del botón. Con un correo sin cuenta aparece el mismo mensaje.
- [ ] F01-CA12 — Con correo y contraseña correctos (el correo con espacios al inicio y al final), la app pasa sola a la tab Mapa.
- [ ] F01-CA13 — Si hay un error en "Iniciar sesión" y abro "Crear cuenta", ahí no se ve ese error.

**Sin internet**

- [ ] F01-CA14 — En modo avión, al tocar "Iniciar sesión" o "Crear cuenta" con datos válidos aparece "No hay conexión. Revisa tu internet e intenta de nuevo." en menos de 2 segundos, y el botón se vuelve a habilitar.
- [ ] F01-CA15 — Con sesión iniciada, en modo avión, cerrar la app por completo y volver a abrirla muestra la vista de carga y luego Mapa (CA05 y CA21 de 01-navigation).

**Perfil y cerrar sesión**

- [ ] F01-CA16 — Perfil muestra mi nombre y mi correo.
- [ ] F01-CA17 — Tocar "Cerrar sesión" muestra la alerta "¿Seguro que quieres cerrar sesión?". Con "Cancelar" sigo en Perfil con sesión (CA06 de 01-navigation).
- [ ] F01-CA18 — Con "Cerrar sesión" en la alerta, el botón se ve deshabilitado con indicador y después aparece "Iniciar sesión"; deslizar hacia atrás no regresa a la app (CA06b de 01-navigation).
- [ ] F01-CA19 — En modo avión, cerrar sesión también lleva a "Iniciar sesión".
- [ ] F01-CA20 — *(Después de F01.16)* Con un check-in activo, después de cerrar sesión el documento `checkins/{mi uid}` ya no existe en la consola de Firestore (RN04). En modo avión la sesión se cierra igual y el documento sigue ahí hasta vencer (RN01).
- [ ] F01-CA21 — *(Después de F01.17 y F01.18)* Después de cerrar sesión e iniciar con **otra** cuenta, en Historial y Perfil no aparece nada de la cuenta anterior, ni con internet ni en modo avión (RN11).

**Pruebas (Jest)**

- [ ] F01-CA22 — `validarCorreo`: vacío, con solo espacios, `'ana@correo'` (inválido) y `' ana@correo.com '` (válido).
- [ ] F01-CA23 — `validarContrasena`: vacía, `'abc12'`, `'abcdef'` y `'abc123'` (válida). `validarInicioSesion` con contraseña `'abc'` no da error de contraseña.
- [ ] F01-CA24 — `obtenerMensajeError(new FirebaseError('auth/invalid-credential', ''))` devuelve "Correo o contraseña incorrectos." y `'auth/email-already-in-use'` devuelve "Ya existe una cuenta con este correo.".
- [ ] F01-CA25 — `obtenerNombreVisible('')` devuelve `'Jugador'` y `obtenerNombreVisible('Ana')` devuelve `'Ana'`.
- [ ] F01-CA26 — **Integración — `PantallaInicioSesion`:** se dibuja `NavegadorRaiz` (como en N9) con el store en `usuario: null` y `revisandoSesion: false`. `servicioSesion` está simulado: `escucharCambiosDeSesion` devuelve una función vacía y nunca avisa, y `entrarConCorreo` rechaza con `auth/invalid-credential`. Al escribir un correo con espacios y una contraseña y tocar el **botón** "Iniciar sesión", aparece "Correo o contraseña incorrectos." y `entrarConCorreo` se llamó con el correo ya limpio.

**Código**

- [ ] F01-CA27 — `npx tsc --noEmit` pasa sin errores y no hay `any` en los archivos de F01.
- [ ] F01-CA28 — Solo `servicioSesion.ts` importa `firebase/auth` (más `FirebaseError` en `errores.ts`, CAD29).
- [ ] F01-CA29 — Ningún store importa `useStoreSesion`, y solo `cerrarSesion` llama a `limpiar()` de otros stores.

---

## Tasks

Cada task ≈ un commit. El orden importa: algunas tasks de 01-navigation y de 02-data-model se intercalan aquí.

**Base de la sesión**

- [ ] **F01.1 — Instalar Zustand** con `npx expo install zustand`. Es la primera feature con store.
- [ ] **F01.2 — Validaciones de correo y contraseña** + pruebas (F01-CA22, F01-CA23). Incluye `validarCorreo`, `validarContrasena`, `validarRegistro`, `validarInicioSesion`, los tipos `ValoresRegistro`, `ValoresInicioSesion`, `ErroresRegistro` y `ErroresInicioSesion`, y la constante `CONTRASENA_LONGITUD_MINIMA`. *Después de D9.*
- [ ] **F01.3 — Mensajes de los errores de Firebase Auth** en `obtenerMensajeError` + prueba (F01-CA24). *Después de D7.*
- [ ] **F01.4 — Crear `servicioSesion`** (`crearCuenta`, `entrarConCorreo`, `salirDeFirebase`, `escucharCambiosDeSesion`, `convertirUsuario`). Usa `firebase.ts` de D2, no lo vuelve a crear. *Después de D2 y D8.*
- [ ] **F01.5 — Crear `useStoreSesion`** con `usuario`, `revisandoSesion`, `cerrandoSesion`, `escucharSesion`, `registrarse`, `iniciarSesion`, `limpiar` y `cerrarSesion` (por ahora solo `signOut` y `limpiar()` de este store).
- [ ] **F01.6 — Escuchar la sesión desde `NavegadorRaiz`** con un `useEffect` que llama a `escucharSesion()` y deja de escuchar al desmontarse.
- ➡️ **Después de F01.6: hacer N8 de 01-navigation** (decisión de sesión en `NavegadorRaiz`). Desde aquí la app muestra "Iniciar sesión" o Mapa según la sesión.
- ➡️ **N9 de 01-navigation** (test de integración de la navegación) se puede hacer cuando existan D6 y F01.5.

**Formularios**

- [ ] **F01.7 — Crear `useFormulario`** en `src/hooks/` como lo describe coding-standards §11.
- [ ] **F01.8 — Crear el componente `CampoTexto`** (etiqueta, placeholder, borde y mensaje de error).
- [ ] **F01.9 — Crear el componente `BotonPrincipal`** (deshabilitado, cargando y `accessibilityRole="button"`).
- [ ] **F01.10 — Implementar `PantallaInicioSesion`**: formulario, error del servidor arriba del botón, enlace "Crear cuenta", `KeyboardAvoidingView` y cerrar el teclado al tocar fuera.
- [ ] **F01.11 — Implementar `PantallaRegistro`**: formulario, error del servidor, enlace "Ya tengo cuenta", teclado igual que F01.10.

**Perfil**

- [ ] **F01.12 — Mostrar nombre y correo en `PantallaPerfil`** con `obtenerNombreVisible` + prueba (F01-CA25).
- [ ] **F01.13 — Agregar "Cerrar sesión" en `PantallaPerfil`**: alerta de confirmación, botón deshabilitado con indicador mientras cierra, y `Alert.alert` si falla (E15).

**Pruebas**

- [ ] **F01.14 — Test de integración de `PantallaInicioSesion`** (F01-CA26; cuenta para los 4 de la rúbrica). *Después de D6.*
- [ ] **F01.15 — Probar en el iPhone** F01-CA01 a F01-CA19 y los criterios de sesión de 01-navigation (CA01–CA07, CA21) que ya se puedan probar.

**Cierre de sesión completo (se hacen después, cuando exista lo que usan)**

- [ ] **F01.16 — Terminar el check-in al cerrar sesión** (RN04): `cerrarSesion` llama siempre a `terminarCheckIn(idUsuario)` **antes** de `signOut`; si falla, `console.error` y sigue. Probar F01-CA20. *Después de D11.*
- [ ] **F01.17 — Borrar la caché del historial al cerrar sesión** (RN11): `borrarCacheHistorial()` después de `signOut`; si falla, `console.error` y sigue. *Después de D16.*
- [ ] **F01.18 — Limpiar los stores al cerrar sesión**: `limpiar()` del store de check-ins (F03) y del de partidos (F06) con `getState()`. Probar F01-CA21. *Después de los stores de F03 y F06.*

---

## Diferencias con lo visto en clase (para la defensa)

| En clase | En HoopsMap | Por qué |
|---|---|---|
| Campos solo con *placeholder* | Etiqueta visible arriba **y** placeholder | El placeholder desaparece al escribir. `CampoTexto` se reutiliza en el formulario de partido (F05), donde hay varios números y hay que saber cuál es cuál |
| Registro con "confirmar contraseña" | Sin ese campo | 00-project pide nombre, correo y contraseña; se cumple la rúbrica en su mínimo |
| La contraseña se valida igual en todos lados | En inicio de sesión solo es obligatoria | Las reglas de una contraseña nueva no aplican a una cuenta que ya existe; Firebase decide si es correcta |
| `validate()` dentro del componente | Funciones puras en `validacionesUsuario.ts` + `useFormulario` | Se prueban con Jest sin simular nada (coding-standards §11) |
| Focus encadenado con refs y `returnKeyType` | No se usa | Decisión del MVP: solo se cierra el teclado al tocar fuera |
| El servidor compara la contraseña con bcrypt y entrega un token | Firebase Auth guarda el hash y maneja el token; la sesión vive en AsyncStorage | Firebase ya hace ese trabajo; la justificación de AsyncStorage está en 02-data-model |
| "Cerrar sesión" navega a Login (taller de *Drawer Navigator*) | La navegación cambia sola con el store | Patrón de autenticación de React Navigation (01-navigation) |
| El error de la petición se guarda junto al formulario | Las acciones del store devuelven el mensaje y la pantalla lo guarda en `useState` | Solo lo usa esa pantalla (coding-standards §8); así un error no aparece en la otra |

---

## Decisiones resueltas

- **Correo:** obligatorio, con `trim()` y la regex de la clase.
- **Contraseña en registro:** sin `trim()`, mínimo 6 caracteres y al menos un número. **En inicio de sesión:** solo obligatoria.
- **Sin "confirmar contraseña"** ni paso entre campos con refs.
- **Errores de Auth:** en `obtenerMensajeError`, con la tabla de esta spec.
- **Error del servidor:** texto en `colores.error` arriba del botón.
- **Pantallas de sesión:** título "HoopsMap" con `titulo`; campos con etiqueta y placeholder; tocar fuera cierra el teclado.
- **Cerrar sesión:** una sola acción `cerrarSesion` en `useStoreSesion`. Orden: terminar check-in (siempre) → `signOut` → borrar caché → limpiar stores. Si falla el check-in o la caché, se sigue; si falla `signOut`, se detiene y se avisa.
- **Sin `verificarConexion()`:** escuchar la sesión y `signOut`. **Con `verificarConexion()`:** registrar e iniciar sesión.
- **Excepción de capas:** solo `cerrarSesion` llama a `limpiar()` de otros stores.
- **Test de integración de F01:** `PantallaInicioSesion` con `auth/invalid-credential`.

---

## Cambios propuestos a otras specs

### `specs/02-data-model.md`

1. **Errores** (tabla de `obtenerMensajeError`): agregar estas filas antes de "Cualquier otro":

   | Error | Mensaje |
   |---|---|
   | `auth/invalid-credential` | "Correo o contraseña incorrectos." |
   | `auth/email-already-in-use` | "Ya existe una cuenta con este correo." |
   | `auth/invalid-email` | "Correo no válido." |
   | `auth/weak-password` | "La contraseña es muy débil." |
   | `auth/too-many-requests` | "Demasiados intentos. Espera unos minutos e intenta de nuevo." |
   | `auth/network-request-failed` | "No hay conexión. Revisa tu internet e intenta de nuevo." |

   Y cambiar *"Los errores de Auth (`auth/...`) los traduce F01."* por *"Los errores de Auth (`auth/...`) también están en esta tabla (los definió F01)."*
2. **Operaciones del backend:** en la *Regla común*, agregar: *"Excepción: `escucharCambiosDeSesion` y `salirDeFirebase` (F01) no llaman a `verificarConexion()`, porque la app debe abrir y cerrar sesión sin internet."* Y agregar una tabla corta *Sesión (F01)* con las 5 funciones de `servicioSesion` (no cuentan para las 7 de la rúbrica).
3. **Flujo principal, paso 8:** cambiar por *"Cerrar sesión (F01): se llama siempre a `terminarCheckIn` (RN04); después `signOut`, se borra la caché del historial y se limpian los stores. Si no hay internet para terminar el check-in, la sesión se cierra igual y el check-in vence solo a los 90 min (RN01)."*
4. **Validaciones → Usuario:** agregar las filas de `validarCorreo`, `validarContrasena`, `validarRegistro` y `validarInicioSesion` con sus mensajes, y `obtenerNombreVisible` en `src/utilidades/usuario.ts`.
5. **Usuario** (`src/tipos/usuario.ts`): agregar `ValoresRegistro`, `ValoresInicioSesion`, `ErroresRegistro` y `ErroresInicioSesion`.
6. **Constantes:** agregar `export const CONTRASENA_LONGITUD_MINIMA = 6; // F01 (igual al mínimo de Firebase)`.

### `docs/coding-standards.md`

1. **§4, Excepciones:** agregar la 4: *"Solo la acción `cerrarSesion` de `useStoreSesion` puede llamar a `limpiar()` de otros stores (`useStoreX.getState().limpiar()`), para cerrar sesión de verdad. Los otros stores nunca importan `useStoreSesion`: reciben `idUsuario` como parámetro."*
2. **§8:** agregar una nota: *"`useStoreSesion` no lleva `cargando` ni `mensajeError`: `revisandoSesion` hace de `cargando`, y `registrarse`, `iniciarSesion` y `cerrarSesion` devuelven `Promise<string | null>` (el mensaje, o `null` si salió bien), porque el error solo lo muestra la pantalla que hizo la petición (F01)."*
3. **§6, Componentes compartidos ya definidos:** agregar `CampoTexto` (etiqueta, placeholder y error) y `BotonPrincipal` (deshabilitado y cargando), definidos en F01.
4. **§12, ejemplo de integración:** cambiar `jest.mock('../servicios/servicioSesion', () => ({}));` por `jest.mock('../servicios/servicioSesion', () => ({ escucharCambiosDeSesion: jest.fn(() => () => {}) }));`, por la misma razón que N9 (ver *01-navigation*, punto 2).

### `CLAUDE.md`

1. **Capas (§4)**, en el resumen: agregar *"Excepción: solo `cerrarSesion` de `useStoreSesion` llama a `limpiar()` de otros stores; los demás stores nunca importan `useStoreSesion`."*

### `specs/01-navigation.md`

1. **Task N8:** cambiar *"Se hace después de la task del store de sesión de F01"* por *"Se hace después de F01.5 y F01.6 (store de sesión y escucha de la sesión)"*.
2. **Task N9:** agregar *"El simulador de `servicioSesion` debe traer `escucharCambiosDeSesion: jest.fn(() => () => {})`. Desde F01.6, `NavegadorRaiz` la llama al montarse; si el simulador está vacío (`() => ({})`), el test truena. Como nunca avisa, no cambia el estado que el test le puso al store."*
### `specs/00-project.md`

1. **Tabla MVP:** en F01, cambiar la columna *Spec* de "pendiente" a `features/F01-auth.md`.