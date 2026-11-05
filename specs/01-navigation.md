# Navegación — HoopsMap

> **Estado:** v1.1 · **Última actualización:** 2026-11-05
> **Depende de:** `specs/00-project.md` (sección *Cumplimiento de la rúbrica* y *Decisiones técnicas*)
> **Clases de referencia:** [Stack Navigator](https://academy.alvesc.com/clase/stack-navigator) · [Tab Navigator](https://academy.alvesc.com/clase/tab-navigator)

---

## Objetivo

Definir cómo se mueve el usuario entre las **8 pantallas** de HoopsMap: qué ve sin sesión, qué ve con sesión, qué datos viajan entre pantallas y qué pasa cuando algo falla. La navegación usa **React Navigation configurada a mano**, igual que en clase: `NavigationContainer`, `createNativeStackNavigator` (Stack) y `createBottomTabNavigator` (Tabs), con los parámetros de cada pantalla tipados.

Cumple el requisito de la rúbrica: **≥ 5 pantallas con Stack + Tabs + Modal**.

---

## Actor

Jugador recreativo de básquetbol, en dos situaciones:

- **Sin sesión:** solo puede iniciar sesión o crear cuenta.
- **Con sesión:** usa el mapa, su historial, su perfil y los modales.

---

## Precondiciones

- Proyecto creado con la plantilla `blank-typescript` (sin Expo Router).
- Dependencias de navegación instaladas (Task N1).
- Para la parte que decide según la sesión (Task N8): existe el store de sesión de F01, que expone si hay usuario y si todavía se está revisando la sesión.

---

## Datos de entrada

| Dato | De dónde viene | Para qué se usa |
|---|---|---|
| Usuario actual (o ninguno) | Store de sesión (F01, Firebase Auth) | Decidir si se muestra la parte de autenticación o la app |
| ¿Se está revisando la sesión? | Store de sesión (F01) | Mostrar una vista de carga al abrir la app |
| `idCancha` | Pantalla Mapa (marcador tocado) | Abrir el detalle de esa cancha |
| `idPartido` | Pantalla Historial (partido tocado) | Editar ese partido o crear su tarjeta |

**Regla de parámetros:** entre pantallas **solo viajan ids** (`idCancha`, `idPartido`), nunca el objeto completo. La pantalla que recibe el id busca el dato en el catálogo (RN05) o en el store de partidos. Así, si el partido se edita, la pantalla siempre muestra la versión actual (es la pregunta 4 del reto de la clase *Stack Navigator*).

---

## Árbol de navegación

Hay **un solo Stack raíz**. Según haya sesión o no, el Stack muestra un grupo de pantallas u otro (ver *Decisión de sesión* más abajo).

```text
NavigationContainer
└── NavegadorRaiz (Native Stack)
    │
    ├── [Mientras se revisa la sesión] → VistaCargando (componente, no es ruta)
    │
    ├── SIN SESIÓN
    │   ├── InicioSesion ........ stack   "Iniciar sesión"
    │   └── Registro ............ stack   "Crear cuenta"
    │
    └── CON SESIÓN
        ├── Principal ........... NavegadorTabs (header oculto; cada tab trae el suyo)
        │   ├── Mapa ............ tab     "Canchas cercanas"
        │   ├── Historial ....... tab     "Mis partidos"      [+] en el header
        │   └── Perfil .......... tab     "Mi perfil"
        │
        ├── DetalleCancha ....... stack   nombre de la cancha  ← recibe idCancha
        ├── FormularioPartido ... modal   "Nuevo partido" / "Editar partido"  ← idPartido opcional
        └── TarjetaJugador ...... modal   "Tarjeta de jugador" ← recibe idPartido
```

**¿Por qué el detalle y los modales están en el Stack raíz y no dentro de las tabs?** Es el patrón *Tabs + Stack* de la clase *Tab Navigator*: las tabs son una pantalla más del Stack (`Principal`), y las pantallas de detalle se abren **encima** de las tabs. Por eso, en el detalle de cancha y en los modales **no se ve la barra de tabs**, y la flecha de regreso devuelve a la tab de donde se vino.

---

## Tabla de pantallas

| # | Componente | Ruta | Título visible | Tipo | Parámetros | Se llega desde |
|---|---|---|---|---|---|---|
| 1 | `PantallaInicioSesion` | `InicioSesion` | Iniciar sesión | Stack | — | Inicio de la app sin sesión; al cerrar sesión |
| 2 | `PantallaRegistro` | `Registro` | Crear cuenta | Stack | — | InicioSesion ("Crear cuenta") |
| 3 | `PantallaMapa` | `Mapa` | Canchas cercanas | Tab (etiqueta "Mapa") | — | Inicio de la app con sesión (tab inicial) |
| 4 | `PantallaHistorial` | `Historial` | Mis partidos | Tab (etiqueta "Historial") | — | Barra de tabs |
| 5 | `PantallaPerfil` | `Perfil` | Mi perfil | Tab (etiqueta "Perfil") | — | Barra de tabs |
| 6 | `PantallaDetalleCancha` | `DetalleCancha` | Nombre de la cancha | Stack | `{ idCancha: string }` | Mapa (tocar un marcador) |
| 7 | `PantallaFormularioPartido` | `FormularioPartido` | Nuevo partido / Editar partido | Modal | `{ idPartido?: string }` o nada | Historial: botón [+] (crear) o tocar un partido (editar) |
| 8 | `PantallaTarjetaJugador` | `TarjetaJugador` | Tarjeta de jugador | Modal | `{ idPartido: string }` | Historial: control de tarjeta en un partido |

Conteo para la rúbrica: **Stack** 3 (1, 2, 6) · **Tabs** 3 (3, 4, 5) · **Modal** 2 (7, 8) → **8 pantallas**. `VistaCargando` es un componente compartido, no una pantalla, y no se cuenta.

**Contenido de cada tab** (lo detalla la spec de cada feature):

- **Mapa** → F02 (mapa y canchas) y F03 (check-in).
- **Historial** → F06 (lista paginada y caché). Desde aquí se crea, edita (F05) y se abre la tarjeta (F07).
- **Perfil** → nombre y correo del usuario, promedios (F06) y botón **Cerrar sesión** (F01).

---

## Tipos de parámetros

### Recomendación: ¿`RootStackParamList` o un nombre en español?

**Recomiendo traducirlo** a `ParametrosStackRaiz` (y `TabParamList` a `ParametrosTabs`), con un comentario que diga a qué nombre de la clase equivale.

- La regla de 00-project.md es "todo lo que nombramos va en español". `RootStackParamList` no viene de la librería: es un nombre que elige el programador (el profesor lo eligió así en su ejemplo). Si lo dejas en inglés, tienes que explicar una excepción, y luego otra para `TabParamList`.
- El **patrón** es idéntico al de clase; solo cambia el nombre. Con el comentario, el profesor lo reconoce de inmediato.

### Archivo `src/navegacion/tipos.ts`

```ts
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Equivale al RootStackParamList de la clase "Stack Navigator".
// Cada ruta dice qué parámetros recibe (undefined = ninguno).
export type ParametrosStackRaiz = {
  // Sin sesión
  InicioSesion: undefined;
  Registro: undefined;
  // Con sesión
  Principal: undefined; // contiene las tabs
  DetalleCancha: { idCancha: string };
  FormularioPartido: { idPartido?: string } | undefined; // sin idPartido = crear, con idPartido = editar
  TarjetaJugador: { idPartido: string };
};

// Equivale al TabParamList de la clase "Tab Navigator".
export type ParametrosTabs = {
  Mapa: undefined;
  Historial: undefined;
  Perfil: undefined;
};

// Pantallas del Stack: igual que en clase.
export type PropsPantallaInicioSesion = NativeStackScreenProps<ParametrosStackRaiz, 'InicioSesion'>;
export type PropsPantallaRegistro = NativeStackScreenProps<ParametrosStackRaiz, 'Registro'>;
export type PropsPantallaDetalleCancha = NativeStackScreenProps<ParametrosStackRaiz, 'DetalleCancha'>;
export type PropsPantallaFormularioPartido = NativeStackScreenProps<ParametrosStackRaiz, 'FormularioPartido'>;
export type PropsPantallaTarjetaJugador = NativeStackScreenProps<ParametrosStackRaiz, 'TarjetaJugador'>;

// Pantallas de Tab: viven dentro de las tabs, pero también navegan
// a rutas del Stack raíz (por ejemplo, Mapa → DetalleCancha).
export type PropsPantallaMapa = CompositeScreenProps<
  BottomTabScreenProps<ParametrosTabs, 'Mapa'>,
  NativeStackScreenProps<ParametrosStackRaiz>
>;
export type PropsPantallaHistorial = CompositeScreenProps<
  BottomTabScreenProps<ParametrosTabs, 'Historial'>,
  NativeStackScreenProps<ParametrosStackRaiz>
>;
export type PropsPantallaPerfil = CompositeScreenProps<
  BottomTabScreenProps<ParametrosTabs, 'Perfil'>,
  NativeStackScreenProps<ParametrosStackRaiz>
>;
```

**`CompositeScreenProps` en palabras sencillas:** "esta pantalla es una tab, **y además** puede navegar a las pantallas del Stack que está afuera". Une los dos tipos en uno. En el ejemplo de la clase *Tab Navigator* esto se resolvió con `navigation: any`, pero el proyecto prohíbe `any` y el propio profesor pide revisar que `navigate` no quede como `as any` (reto de la clase *Stack Navigator*).

---

## Decisión de sesión (autenticación ↔ app)

### Cómo se decide

`NavegadorRaiz` lee del store de sesión (F01) dos cosas: si hay usuario y si todavía se está revisando la sesión. Con eso hay tres casos:

| Estado | Lo que se muestra |
|---|---|
| Revisando la sesión (al abrir la app, Firebase lee la sesión guardada en AsyncStorage) | `VistaCargando` en lugar del navegador |
| Sin usuario | Grupo **sin sesión**: `InicioSesion` (primera) y `Registro` |
| Con usuario | Grupo **con sesión**: `Principal` (tabs, empieza en Mapa), `DetalleCancha`, `FormularioPartido`, `TarjetaJugador` |

Esqueleto (solo para entender la idea; el código final se hace en Claude Code):

```tsx
if (revisandoSesion) {
  return <VistaCargando />;
}

return (
  <Stack.Navigator screenOptions={opcionesHeader}>
    {usuario === null ? (
      <>
        <Stack.Screen name="InicioSesion" component={PantallaInicioSesion} options={{ title: 'Iniciar sesión' }} />
        <Stack.Screen name="Registro" component={PantallaRegistro} options={{ title: 'Crear cuenta' }} />
      </>
    ) : (
      <>
        <Stack.Screen name="Principal" component={NavegadorTabs} options={{ headerShown: false }} />
        <Stack.Screen name="DetalleCancha" component={PantallaDetalleCancha} options={{ title: 'Cancha' }} />
        <Stack.Screen name="FormularioPartido" component={PantallaFormularioPartido} options={{ presentation: 'modal' }} />
        <Stack.Screen name="TarjetaJugador" component={PantallaTarjetaJugador} options={{ presentation: 'modal', title: 'Tarjeta de jugador' }} />
      </>
    )}
  </Stack.Navigator>
);
```

**Por qué así y no con `navigate('InicioSesion')`:** es la forma que recomienda la documentación de React Navigation para flujos de autenticación. Las pantallas de un grupo **no existen** mientras se muestra el otro, así que:

- Al iniciar sesión **no se llama a `navigate`**: el store cambia, React vuelve a dibujar y aparece Mapa solo.
- Después de iniciar sesión, deslizar hacia atrás **no puede** regresar al login, porque esa pantalla ya no existe.
- No hace falta `navigation.reset` ni lógica extra. Es lo más fácil de explicar: "la navegación depende de una variable".

> En el taller de la clase *Drawer Navigator* el botón "Cerrar sesión" navega a Login. Aquí no se hace así porque, con el patrón anterior, la ruta `InicioSesion` no existe mientras hay sesión y `navigate` fallaría. El resultado para el usuario es el mismo.

### Al iniciar sesión o registrarse

- **Inicio de sesión exitoso (F01):** el store guarda el usuario → aparece `Principal` en la tab Mapa.
- **Registro exitoso (F01):** Firebase deja al usuario con sesión iniciada → aparece `Principal` en la tab Mapa. No se regresa al login.

### Al cerrar sesión

1. El usuario toca **Cerrar sesión** en Perfil.
2. Aparece una alerta (`Alert.alert`) con el mensaje "¿Seguro que quieres cerrar sesión?" y dos botones: **"Cancelar"** (no pasa nada, sigue en Perfil) y **"Cerrar sesión"** (estilo `destructive`, en rojo en iPhone). La acción de cerrar sesión la implementa F01.
3. Si confirma, Firebase cierra la sesión → el store queda sin usuario.
4. Todas las pantallas del grupo con sesión se desmontan (incluido cualquier modal abierto) y se muestra `InicioSesion`.
5. Si se vuelve a iniciar sesión, la app empieza **desde cero en Mapa**, no en la última tab visitada.

**Requisito para F01 y F06 (no lo hace la navegación):** cerrar sesión debe terminar el check-in activo (RN04), y borrar también la caché del historial (RN11) y los stores con datos del usuario. Como dice la clase *Persistencia Local*: cerrar sesión no es solo borrar la sesión, es borrar todo lo asociado al usuario.

---

## Flujo principal

1. El usuario abre la app → se ve `VistaCargando` mientras Firebase revisa si hay sesión guardada.
2. **Sin sesión:** aparece "Iniciar sesión".
   - Toca "Crear cuenta" → se abre "Crear cuenta" (con flecha de regreso).
   - Al iniciar sesión o registrarse correctamente → aparece la tab **Mapa**.
3. **Con sesión:** se ve la barra de tabs (Mapa, Historial, Perfil).
4. En **Mapa**, toca un marcador → se abre el detalle de esa cancha (`navigate('DetalleCancha', { idCancha })`) con su nombre en el header. La flecha de regreso vuelve al Mapa.
5. En **Historial**:
   - Toca **[+]** en el header → se abre el modal "Nuevo partido" (`navigate('FormularioPartido')`).
   - Toca un partido → se abre el modal "Editar partido" (`navigate('FormularioPartido', { idPartido })`).
   - Toca el control de tarjeta de un partido → se abre el modal "Tarjeta de jugador" (`navigate('TarjetaJugador', { idPartido })`).
   - Al guardar, eliminar o cancelar, el modal se cierra con `goBack()` y se regresa al Historial.
6. En **Perfil**, toca "Cerrar sesión" y confirma en la alerta → aparece "Iniciar sesión" (ver *Al cerrar sesión*).

### Resumen de movimientos

| Desde | Hacia | Cómo | Método |
|---|---|---|---|
| InicioSesion | Registro | Botón/enlace "Crear cuenta" | `navigate('Registro')` |
| Registro | InicioSesion | Flecha de regreso o enlace "Ya tengo cuenta" | `goBack()` |
| Mapa | DetalleCancha | Tocar marcador | `navigate('DetalleCancha', { idCancha })` |
| DetalleCancha | Mapa | Flecha de regreso | automático / `goBack()` |
| Historial | FormularioPartido (crear) | Botón [+] del header | `navigate('FormularioPartido')` |
| Historial | FormularioPartido (editar) | Tocar un partido | `navigate('FormularioPartido', { idPartido })` |
| Historial | TarjetaJugador | Control de tarjeta del partido | `navigate('TarjetaJugador', { idPartido })` |
| FormularioPartido | Historial | "Cancelar", deslizar hacia abajo, o tras guardar/eliminar | `goBack()` |
| TarjetaJugador | Historial | "Cerrar" o deslizar hacia abajo | `goBack()` |
| Perfil | InicioSesion | Cerrar sesión y confirmar en la alerta | Cambio del store (sin `navigate`) |
| InicioSesion / Registro | Mapa | Sesión iniciada | Cambio del store (sin `navigate`) |

Se usa `navigate` y no `push`: si el usuario toca dos veces seguidas el mismo marcador, no se abren dos detalles iguales.

---

## Presentación (headers, tabs e iconos)

### Paleta y tipografía (`src/constantes/tema.ts`)

Estilo **minimalista**: fondos claros, texto casi negro y **un solo color de acento** (naranja de balón) para lo que se puede tocar o está activo. Los headers y la barra de tabs son blancos; el naranja aparece solo en botones, iconos activos y la flecha de regreso.

**Colores**

| Nombre en `tema.ts` | Valor | Uso |
|---|---|---|
| `primario` | `#C2410C` | Acento: tab activa, botones del header ([+], Cancelar, Cerrar, flecha), botones principales |
| `textoSobrePrimario` | `#FFFFFF` | Texto encima de un botón naranja |
| `fondo` | `#F7F7F5` | Fondo de las pantallas (blanco cálido) |
| `superficie` | `#FFFFFF` | Header, barra de tabs, tarjetas y campos de formulario |
| `texto` | `#1C1C1E` | Títulos y texto principal |
| `textoSecundario` | `#6B6B70` | Texto de apoyo (fechas, etiquetas) |
| `inactivo` | `#8E8E93` | Iconos de tabs inactivas, controles deshabilitados |
| `borde` | `#E5E5EA` | Líneas divisoras y bordes de campos |
| `error` | `#C62828` | Mensajes de error y botón "Eliminar" |
| `exito` | `#2E7D32` | Confirmaciones (por ejemplo, "Ganó") |

Todos los textos cumplen el contraste mínimo recomendado para leerse bien (4.5 a 1): el naranja `#C2410C` funciona tanto como texto sobre blanco como fondo de botón con texto blanco. Por eso se eligió un naranja un poco oscuro y no uno brillante. Los colores de los niveles de afluencia (RN07) los agrega F02 a este mismo archivo.

**Tipografía:** la fuente del sistema (San Francisco en iPhone). No se instala ninguna fuente, se ve nativa y es lo más minimalista.

| Nombre | Tamaño | Peso | Uso |
|---|---|---|---|
| `titulo` | 28 | `'700'` | Título grande de una pantalla (por ejemplo, el de "Iniciar sesión") |
| `subtitulo` | 20 | `'600'` | Encabezados de sección |
| `cuerpo` | 16 | `'400'` | Texto normal y campos |
| `pequeno` | 13 | `'400'` | Texto de apoyo |

Los títulos de los headers usan el tamaño estándar de iOS con peso `'600'`.

**Espaciado y bordes:** `espaciado` = 4, 8, 16, 24, 32 (`xs`, `sm`, `md`, `lg`, `xl`); `radio` = 12 para tarjetas y botones.

### Headers consistentes

- Un solo objeto `opcionesHeader` (en `src/navegacion/opcionesHeader.ts`) con `headerStyle`, `headerTintColor` y `headerTitleStyle`, igual que el `screenOptions` de la clase *Stack Navigator*:
  - `headerStyle`: fondo `superficie` (blanco).
  - `headerTintColor`: `primario` (flecha de regreso y botones del header en naranja).
  - `headerTitleStyle`: color `texto`, peso `'600'`.
- Se usa en el `screenOptions` del **Stack** y del **Tab**, para que todos los headers se vean iguales.
- Los colores y la tipografía salen de `tema.ts`. **No** se escriben colores sueltos en los navegadores.
- `Principal` lleva `headerShown: false` en el Stack, porque cada tab muestra su propio header (si no, se verían dos headers encimados).

### Títulos

| Pantalla | Título | Cómo se pone |
|---|---|---|
| InicioSesion, Registro, tabs, TarjetaJugador | Fijo (ver tabla de pantallas) | `options={{ title: '…' }}` |
| DetalleCancha | Nombre de la cancha del catálogo (RN05); mientras tanto, "Cancha" | `navigation.setOptions` dentro de `useLayoutEffect` en la pantalla (actividad 3 de la clase *Stack Navigator*) |
| FormularioPartido | "Editar partido" si llega `idPartido`; si no, "Nuevo partido" | `options` como función que lee `route.params` (ejemplo *Header Personalizado* de la clase) |

### Botones del header

| Pantalla | Botón | Lado | Acción |
|---|---|---|---|
| Historial | Icono "+" (Ionicons `add`) | Derecha | Abre "Nuevo partido" |
| FormularioPartido | Texto "Cancelar" | Izquierda | `goBack()` |
| TarjetaJugador | Texto "Cerrar" | Izquierda | `goBack()` |

En iPhone, un modal no trae flecha de regreso; por eso los dos modales llevan su botón para cerrar. También se cierran deslizando hacia abajo (comportamiento normal de iOS).

### Tabs e iconos

- Iconos de **Ionicons** (`@expo/vector-icons`), que se instala con `npx expo install @expo/vector-icons`.
- Cada tab usa la versión rellena cuando está activa y la de contorno cuando no:

| Tab | Etiqueta | Icono activo | Icono inactivo |
|---|---|---|---|
| Mapa | Mapa | `map` | `map-outline` |
| Historial | Historial | `list` | `list-outline` |
| Perfil | Perfil | `person` | `person-outline` |

- `tabBarActiveTintColor` = `primario`; `tabBarInactiveTintColor` = `inactivo`; fondo de la barra = `superficie` (igual que en la clase, pero con colores de `tema.ts`).
- La tab inicial es **Mapa** (es la feature central, F03).
- No se usan *badges* (no hay nada que contar en el MVP).

---

## Estructura de archivos

```text
App.tsx                              ← NavigationContainer + NavegadorRaiz (nada más)
src/
├── navegacion/
│   ├── tipos.ts                     ← ParametrosStackRaiz, ParametrosTabs y props de cada pantalla
│   ├── opcionesHeader.ts            ← estilo compartido de headers
│   ├── NavegadorRaiz.tsx            ← Stack raíz + decisión de sesión
│   └── NavegadorTabs.tsx            ← las 3 tabs con iconos
├── pantallas/
│   ├── PantallaInicioSesion.tsx
│   ├── PantallaRegistro.tsx
│   ├── PantallaMapa.tsx
│   ├── PantallaHistorial.tsx
│   ├── PantallaPerfil.tsx
│   ├── PantallaDetalleCancha.tsx
│   ├── PantallaFormularioPartido.tsx
│   └── PantallaTarjetaJugador.tsx
└── componentes/
    ├── VistaCargando.tsx            ← carga de sesión (y estado "cargando" de las pantallas)
    ├── VistaError.tsx               ← mensaje + botón (errores y casos de "no encontrado")
    └── VistaVacia.tsx               ← mensaje cuando una lista no tiene datos
```

**Regla de la clase *Tab Navigator* (reto "La navegación amnésica"):** cada pantalla se importa desde su archivo en `src/pantallas/`. Nunca se declara una pantalla **dentro** de un navegador o de `App`, ni con `component={() => …}`. Si se hace, la pantalla se vuelve a crear en cada render y pierde su estado (scroll, texto escrito).

---

## Validaciones

- **Parámetros tipados:** TypeScript no deja compilar un `navigate` con parámetros incorrectos (por ejemplo, `navigate('DetalleCancha')` sin `idCancha`, o `idCancha` como número).
- **`idCancha` válido:** `PantallaDetalleCancha` busca el id en el catálogo de canchas (RN05). Si no existe → caso E1.
- **`idPartido` válido:** `PantallaFormularioPartido` (modo editar) y `PantallaTarjetaJugador` buscan el id entre **los partidos del usuario** (RN10). Si no está → casos E2 y E3. Un id de un partido de otra persona se trata igual que uno inexistente.
- **Pantallas protegidas:** las rutas con sesión solo existen si hay usuario (ver *Decisión de sesión*). Es una ayuda de experiencia de usuario; la seguridad real está en las reglas de Firestore (RN10), como dice la clase *Autenticación y Seguridad*.

---

## Casos de error y casos límite

| ID | Situación | Comportamiento esperado |
|---|---|---|
| E1 | Se abre `DetalleCancha` con un `idCancha` que no está en el catálogo (por ejemplo, la cancha de prueba de RN05 ya no está en `.env`) | Header "Cancha". `VistaError` con "No encontramos esta cancha" y botón "Volver al mapa" (`goBack()`). Nunca pantalla en blanco ni cierre de la app. |
| E2 | Se abre "Editar partido" con un `idPartido` que no existe (se borró desde otro teléfono, o no es del usuario, RN10) | `VistaError` con "Este partido ya no existe" y botón "Cerrar" (`goBack()`). No se muestra el formulario vacío. |
| E3 | Se abre `TarjetaJugador` con un `idPartido` que no existe | Igual que E2. |
| E4 | El usuario desliza hacia abajo el modal del formulario con datos escritos | El modal se cierra y los datos **se descartan sin preguntar** (comportamiento normal de iOS). Pedir confirmación es una mejora fuera del MVP. |
| E5 | La sesión termina mientras hay un modal abierto (cerró sesión o Firebase invalidó la sesión) | El modal desaparece y se muestra "Iniciar sesión". Lo no guardado se pierde. |
| E6 | Se abre la app **sin internet** y **con** sesión guardada | Firebase recupera la sesión guardada → se muestra Mapa. Se puede navegar por todas las pantallas; los datos que falten los manejan F02–F07 (Historial desde caché, RN11). |
| E7 | Se abre la app **sin internet** y **sin** sesión | Se muestra "Iniciar sesión". El error al intentar entrar lo maneja F01. |
| E8 | Se abre el formulario o se intenta crear/editar **sin internet** | La navegación no lo bloquea. F05/F06 deciden si el botón se deshabilita o se muestra error (RN11: crear y editar requieren conexión). |
| E9 | Permisos de ubicación o cámara negados | No afectan la navegación: todas las pantallas abren. Mapa (F02) y Tarjeta (F07) muestran su explicación; nunca se queda una pantalla en blanco. |
| E10 | Doble toque rápido en un marcador o en un partido | Se abre **una sola** pantalla (se usa `navigate`, no `push`). |
| E11 | El usuario cambia de tab y regresa | La tab conserva su estado (por ejemplo, la posición del scroll en Historial). |
| E12 | Firebase tarda en responder al revisar la sesión | Se mantiene `VistaCargando`; no aparece el login por un instante y luego la app (sin "parpadeo"). |

---

## Resultado esperado

La app tiene 8 pantallas organizadas en un Stack raíz con Tabs y dos Modales. Sin sesión solo se ven inicio de sesión y registro; con sesión se ven las tabs y las pantallas que se abren encima. Todos los headers tienen el mismo estilo, las tabs tienen iconos que cambian al estar activas, los parámetros están tipados sin `any`, y ninguna navegación con datos inválidos deja la pantalla en blanco.

---

## Criterios de aceptación

Probados en el iPhone con Expo Go.

**Sesión**

- [ ] CA01 — Con la app recién instalada (sin sesión), lo primero que se ve después de la carga es "Iniciar sesión" y **no** se ve la barra de tabs.
- [ ] CA02 — Desde "Iniciar sesión", "Crear cuenta" abre la pantalla "Crear cuenta" con flecha de regreso; la flecha vuelve a "Iniciar sesión".
- [ ] CA03 — Al iniciar sesión correctamente aparece la tab Mapa sin tocar nada más.
- [ ] CA04 — Después de iniciar sesión, deslizar desde el borde izquierdo **no** regresa a "Iniciar sesión".
- [ ] CA05 — Con sesión iniciada, cerrar la app por completo y volver a abrirla muestra la vista de carga y luego Mapa; **nunca** aparece "Iniciar sesión" por un instante.
- [ ] CA06 — Tocar "Cerrar sesión" en Perfil muestra la alerta "¿Seguro que quieres cerrar sesión?". Con "Cancelar" sigo en Perfil con la sesión abierta.
- [ ] CA06b — Con "Cerrar sesión" en la alerta se muestra "Iniciar sesión"; deslizar hacia atrás no regresa a la app.
- [ ] CA07 — Después de cerrar sesión estando en Historial, al iniciar sesión de nuevo la app empieza en Mapa.

**Tabs y headers**

- [ ] CA08 — Con sesión se ven 3 tabs en este orden: Mapa, Historial, Perfil, cada una con su icono de Ionicons.
- [ ] CA09 — La tab activa muestra su icono relleno en el color primario; las inactivas, el icono de contorno en el color inactivo.
- [ ] CA10 — Los headers de las 3 tabs, de "Detalle de cancha" y de las pantallas de sesión son blancos, con el título en `texto` y los botones/flecha en `primario`, y muestran los títulos de la tabla de pantallas.
- [ ] CA11 — Solo se ve **un** header en cada tab (no hay header duplicado).
- [ ] CA12 — Si hago scroll en Historial, cambio a Perfil y regreso, el scroll sigue donde estaba.

**Stack y modales**

- [ ] CA13 — Tocar una cancha en Mapa abre su detalle con el nombre de la cancha en el header; no se ve la barra de tabs; la flecha de regreso vuelve a Mapa.
- [ ] CA14 — El botón [+] del header de Historial abre "Nuevo partido" deslizándose desde abajo.
- [ ] CA15 — Tocar un partido en Historial abre el modal con el título "Editar partido".
- [ ] CA16 — El control de tarjeta de un partido abre "Tarjeta de jugador" como modal.
- [ ] CA17 — "Cancelar" (formulario) y "Cerrar" (tarjeta) cierran el modal y regresan a Historial; deslizar hacia abajo también.
- [ ] CA18 — Tocar dos veces muy rápido un marcador abre un solo detalle (con una sola flecha de regreso se vuelve al Mapa).

**Errores**

- [ ] CA19 — Abrir `DetalleCancha` con un `idCancha` que no está en el catálogo muestra "No encontramos esta cancha" y el botón "Volver al mapa" funciona.
- [ ] CA20 — Abrir "Editar partido" o "Tarjeta de jugador" con un `idPartido` inexistente muestra "Este partido ya no existe" y el botón "Cerrar" funciona.
- [ ] CA21 — Con modo avión y sesión guardada, la app abre en Mapa y se puede entrar a las 3 tabs y al detalle de una cancha sin que se cierre.

**Código**

- [ ] CA22 — `npx tsc --noEmit` pasa sin errores, y si escribo `navigate('DetalleCancha')` sin `idCancha`, TypeScript marca error.
- [ ] CA23 — No hay `any` en `src/navegacion/` ni en `src/pantallas/`.
- [ ] CA24 — Ninguna pantalla está declarada dentro de un navegador ni con `component={() => …}`.
- [ ] CA25 — El test de integración de navegación (Task N9) pasa.

---

## Tasks

Cada task ≈ un commit.

- [x] **N1 — Instalar dependencias de navegación.** `npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context`. Son los mismos paquetes de la clase, pero con `npx expo install` en lugar de `npm install`, para que Expo elija versiones compatibles con Expo Go.
- [ ] **N2 — Crear `src/constantes/tema.ts` y `opcionesHeader.ts`.** `tema.ts` con la paleta, tipografía, espaciado y radio de la sección *Paleta y tipografía*; `opcionesHeader.ts` con el estilo de header de esta spec.
- [ ] **N3 — Crear `src/navegacion/tipos.ts`** con `ParametrosStackRaiz`, `ParametrosTabs` y las props de las 8 pantallas.
- [ ] **N4 — Crear las 8 pantallas provisionales** en `src/pantallas/` (solo un texto con su nombre, tipadas con sus props) y `VistaCargando` en `src/componentes/`.
- [ ] **N5 — Crear `NavegadorTabs`** con Mapa, Historial y Perfil, títulos, iconos Ionicons y colores del tema.
- [ ] **N6 — Crear `NavegadorRaiz` y conectarlo en `App.tsx`.** Stack con `Principal` (header oculto), `DetalleCancha` y los dos modales (`presentation: 'modal'`). Por ahora sin la decisión de sesión: siempre muestra la parte con sesión.
- [ ] **N7 — Agregar títulos dinámicos, botones del header y botones provisionales de navegación.** Título del formulario según `idPartido`; "Cancelar" y "Cerrar" en los modales; [+] en Historial; botones provisionales en Mapa ("Ver Sullivan" → `idCancha: 'sullivan'`) y en Historial (editar/tarjeta con un id de prueba) para probar CA13–CA18. Los provisionales se quitan cuando F02 y F06 pongan los reales.
- [ ] **N8 — Agregar la decisión de sesión** en `NavegadorRaiz` (grupos sin sesión / con sesión y `VistaCargando`). *Se hace después de F01.5 y F01.6 (store de sesión y escucha de la sesión).*
- [ ] **N9 — Test de integración de navegación** (cuenta para los 4 de la rúbrica): con el store simulado sin usuario se ve "Iniciar sesión"; con usuario se ve la tab Mapa. *Requiere Jest configurado.* El simulador de `servicioSesion` debe traer `escucharCambiosDeSesion: jest.fn(() => () => {})`: desde F01.6, `NavegadorRaiz` la llama al montarse y, con el simulador vacío (`() => ({})`), el test truena. Como nunca avisa, no cambia el estado que el test le puso al store.
- [ ] **N10 — Probar los criterios de aceptación en el iPhone** y marcar los que ya se pueden probar. Los que dependen de otras features se marcan cuando esas features estén listas.

### Tasks que se implementan en otras features

Esta spec define el comportamiento, pero el código va con la feature que tiene los datos:

- **Título con el nombre de la cancha y caso E1** → F04 (usa el catálogo de RN05).
- **Casos E2 y E3** → F05 (formulario) y F07 (tarjeta).
- **Alerta de confirmación y acción de cerrar sesión** → F01.
- **Borrar caché y stores al cerrar sesión** → F01 y F06.
- **Control para abrir la tarjeta en cada partido del Historial** → F06 define cómo se ve.

---

## Diferencias con lo visto en clase (para la defensa)

| En clase | En HoopsMap | Por qué |
|---|---|---|
| `npm install` | `npx expo install` | Elige versiones de los paquetes nativos compatibles con Expo Go. |
| `RootStackParamList`, `TabParamList` | `ParametrosStackRaiz`, `ParametrosTabs` | Regla de nombres en español de 00-project.md; el patrón es el mismo. |
| Iconos con emoji en `<Text>` | Ionicons de `@expo/vector-icons` | Cambian de color con la tab activa; se instalan con `npx expo install`. |
| `navigation: any` en pantallas de tab | `CompositeScreenProps` | El proyecto prohíbe `any`; el profesor pide revisar que `navigate` no sea `as any`. |
| "Cerrar sesión" navega a Login | La navegación cambia sola según el store | Patrón de autenticación recomendado por React Navigation; impide regresar al login con el gesto. |

---

## Decisiones resueltas

- **Nombres de los tipos:** `ParametrosStackRaiz` y `ParametrosTabs` (traducidos, con comentario que indica su equivalente de clase).
- **Decisión de sesión:** render condicional según el store, sin `navigate` al login.
- **Tipos de las tabs:** `CompositeScreenProps`, sin `any`.
- **Iconos:** Ionicons de `@expo/vector-icons`.
- **Tarjeta de jugador:** se abre desde un partido del Historial y recibe `idPartido`.
- **Perfil:** nombre, correo, promedios y cerrar sesión.
- **Nuevo partido:** solo desde el botón [+] del Historial.
- **Modal del formulario:** deslizar hacia abajo descarta los datos sin preguntar (E4).
- **Paleta:** minimalista, blanco + naranja `#C2410C` como único acento, fuente del sistema.
- **Cerrar sesión:** pide confirmación con una alerta.