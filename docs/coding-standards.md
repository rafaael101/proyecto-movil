# Estándar de código — HoopsMap

> **Estado:** v2.1 · **Última actualización:** 2026-11-05
> **Depende de:** `specs/00-project.md` (fuente de verdad), `specs/01-navigation.md` y `specs/02-data-model.md`. Si este documento y una spec no coinciden, **manda la spec** y se corrige este archivo.
> **Clases de referencia:** [Git y Deploy](https://academy.alvesc.com/clase/git-y-deploy) · [TypeScript Básico](https://academy.alvesc.com/clase/typescript-basico) · [Hooks con TypeScript](https://academy.alvesc.com/clase/hooks-typescript) · [StyleSheet y Flexbox](https://academy.alvesc.com/clase/stylesheet-flexbox) · [Validación de Formularios](https://academy.alvesc.com/clase/validacion-formularios) · [Custom Hook de Formulario](https://academy.alvesc.com/clase/custom-hook-formulario) · [Sugerencias de Proyectos Finales](https://academy.alvesc.com/clase/sugerencias-de-proyectos-finales)

Guía de consulta para escribir el código de HoopsMap (a mano o con Claude Code). No es una spec: no define features. Las reglas de negocio (RNxx), los mensajes de error concretos y las validaciones de cada campo **no se repiten aquí**; viven en las specs.

---

## 0. Principios

1. **Si no lo puedes explicar en voz alta, no entra.** La defensa es línea por línea.
2. **Spec primero.** Nada se implementa sin su spec en `specs/`. Una task de la spec ≈ un commit.
3. **Una responsabilidad por archivo.** Una pantalla, un componente, un servicio, un store.
4. **Ninguna pantalla en blanco.** Toda pantalla con datos contempla cargando, error, vacío y datos; los permisos negados y la falta de internet tienen su mensaje.
5. **Como en clase.** Si nos apartamos de lo que enseñó el profesor, se deja un comentario que dice por qué (igual que la tabla *Diferencias con lo visto en clase* de las specs).
6. **El mínimo de la rúbrica, sin extras.** Nada que no esté en `00-project.md`.

---

## 1. Idioma

| Qué | Idioma | Ejemplo |
|---|---|---|
| Lo que nombramos (variables, funciones, tipos, componentes, archivos, carpetas, variables de `.env`) | Español **sin acentos ni ñ** | `calcularPromedios`, `PantallaMapa.tsx`, `anio`, `esDueno` |
| APIs de librerías | Inglés (no se tocan) | `useState`, `navigate`, `onPress`, `setDoc` |
| Textos que ve el usuario | Español **con** acentos y ñ | `"Iniciar sesión"`, `"Año"` |
| Comentarios, specs, documentación | Español | `// RN03: setDoc reemplaza el check-in anterior` |
| Descripciones de tests (`describe`, `it`) | Español | `it('devuelve 0 si el check-in ya venció')` |
| Mensajes de commit | Español | `agrega tipos de las entidades (D3)` |

"Check-in" se queda como en las specs: `CheckIn`, `crearCheckIn`, `CHECK_IN_DURACION_MINUTOS`.

**Excepción para las specs:** la carpeta `specs/` y sus archivos conservan los nombres de *Estructura de specs* de 00-project (`00-project.md`, `01-navigation.md`, `F03-check-in.md`). Lo que va dentro de cada spec sí va en español.
La carpeta `docs/` y este archivo (`coding-standards.md`) también conservan su nombre.

---

## 2. Estructura de carpetas

```text
HoopsMap/
├── App.tsx                 ← solo NavigationContainer + NavegadorRaiz (01-navigation)
├── src/
│   ├── navegacion/         ← navegadores, tipos de parámetros y estilo de headers
│   ├── pantallas/          ← las 8 pantallas de 01-navigation, una por archivo
│   ├── componentes/        ← piezas de UI reutilizables
│   ├── hooks/              ← custom hooks (useFormulario)
│   ├── stores/             ← estado global con Zustand
│   ├── servicios/          ← único lugar que habla con Firebase, AsyncStorage, NetInfo y módulos nativos
│   ├── utilidades/         ← funciones puras (validaciones, fechas, conteos, promedios, errores)
│   ├── constantes/         ← tema.ts, configuracion.ts, canchas.ts
│   └── tipos/              ← tipos de las entidades (02-data-model)
├── specs/                  ← especificaciones SDD (nombres en excepción, sección 1)
├── docs/                   ← este documento y la arquitectura (nombres en excepción, sección 1)
├── CLAUDE.md               ← instrucciones que Claude Code lee en cada sesión
├── assets/                 ← íconos e imágenes de la plantilla
├── firestore.rules         ← copia de las reglas publicadas (02-data-model)
├── jest.setup.ts           ← simuladores para los tests (sección 12)
├── .env.example            ← variables sin valores
└── .prettierrc             ← formato (sección 16)
```

> **Excepciones de nombre:** `hooks/` y `stores/` conservan la palabra de la herramienta, igual que el prefijo `use`. Son vocabulario de React y Zustand (como `navigate`), no nombres que inventamos. `CLAUDE.md` se llama así porque es el nombre que busca Claude Code. Los archivos de `specs/` tienen su propia excepción (sección 1).

| Carpeta | Qué va | Ejemplos (de las specs) | Qué **no** va |
|---|---|---|---|
| `navegacion/` | Navegadores, `tipos.ts` y `opcionesHeader.ts` | `NavegadorRaiz.tsx`, `NavegadorTabs.tsx` | Pantallas declaradas dentro del navegador |
| `pantallas/` | Una pantalla: lee stores, arma componentes, navega, maneja los 4 estados | `PantallaMapa.tsx`, `PantallaFormularioPartido.tsx` | Llamadas a servicios o a Firebase |
| `componentes/` | UI que recibe datos por props y avisa con callbacks | `VistaCargando.tsx`, `VistaError.tsx`, `VistaVacia.tsx` | Stores, servicios, `navigate` |
| `hooks/` | Lógica reutilizable con estado **local** | `useFormulario.ts` | Estado que comparten varias pantallas (eso es un store) |
| `stores/` | Un store de Zustand por tema | `useStoreSesion.ts` (F01) | Componentes o imports de Firebase |
| `servicios/` | Firebase, AsyncStorage, NetInfo y módulos nativos | `firebase.ts`, `servicioConexion.ts`, `servicioCheckIns.ts`, `servicioPartidos.ts`, `servicioCache.ts` | Textos para el usuario, estado |
| `utilidades/` | Funciones **puras**: mismo resultado para los mismos datos | `fechas.ts`, `errores.ts`, `validacionesPartido.ts`, `afluencia.ts`, `promedios.ts`, `canchas.ts` | Firebase, AsyncStorage, `new Date()` adentro (la fecha llega como parámetro) |
| `constantes/` | Valores fijos | `tema.ts`, `configuracion.ts`, `canchas.ts` | Funciones con lógica |
| `tipos/` | Tipos de las entidades | `cancha.ts`, `usuario.ts`, `checkIn.ts`, `partido.ts` | Tipos de navegación (van en `navegacion/tipos.ts`) o de Firebase |

---

## 3. Nombres

### 3.1 Archivos

**Regla general:** si el archivo exporta una cosa principal, se llama igual que ella. Si exporta varias funciones, se llama por su tema.

| Tipo de archivo | Convención | Ejemplo |
|---|---|---|
| Pantalla | `Pantalla` + nombre, PascalCase | `PantallaHistorial.tsx` |
| Componente | PascalCase, igual que el componente | `VistaError.tsx`, `TarjetaPartido.tsx` |
| Navegador | `Navegador` + nombre | `NavegadorTabs.tsx` |
| Hook | `use` + qué hace | `useFormulario.ts` |
| Store | `useStore` + tema | `useStoreSesion.ts` |
| Servicio | `servicio` + tema, camelCase | `servicioPartidos.ts` |
| Utilidades | tema en camelCase | `fechas.ts`, `validacionesPartido.ts` |
| Tipos | entidad en camelCase | `partido.ts`, `checkIn.ts` |
| Test | mismo nombre + `.test` | `promedios.test.ts`, `NavegadorRaiz.test.tsx` |
| Spec | El de *Estructura de specs* de 00-project (excepción, sección 1) | `02-data-model.md`, `F05-game-crud.md` |

`.tsx` solo si el archivo tiene JSX; si no, `.ts`.

### 3.2 Dentro del código

| Qué | Convención | Ejemplo |
|---|---|---|
| Componente / pantalla | PascalCase | `PantallaMapa`, `VistaError` |
| Props | `Props` + componente | `PropsVistaError`, `PropsPantallaMapa` |
| Tipo | PascalCase, sustantivo | `Partido`, `ResumenAfluencia` |
| Función | verbo en infinitivo + objeto | `crearCheckIn`, `calcularPromedios`, `validarFecha` |
| Manejador de evento (en la pantalla) | `manejar` + acción | `manejarGuardar`, `manejarCerrarSesion` |
| Prop de callback (en un componente) | `al` + evento | `alPresionar`, `alPresionarBoton` |
| Booleano | `es` / `esta` / `hay` / `puede` / `tiene`, o gerundio si es algo en curso | `estaActivo`, `hayMas`, `esDueno`, `cargando`, `revisandoSesion` |
| Id | `id` + entidad | `idCancha`, `idUsuario`, `idPartido` |
| Hook | `use` + qué hace (React lo exige) | `useFormulario` |
| Store | `useStore` + tema | `useStoreSesion` |
| Tipo del estado de un store | `Estado` + tema | `EstadoSesion` |
| Constante de configuración | `MAYUSCULAS_CON_GUION_BAJO` | `PARTIDOS_POR_PAGINA` |
| Objeto de estilos | `estilos` | `const estilos = StyleSheet.create({...})` |
| Ruta de navegación | PascalCase, sin "Pantalla" | `'DetalleCancha'`, `'Historial'` |

```ts
// ✅ Así sí
const partidos: Partido[] = [];
const hayConexion = await verificarConexion();
function obtenerNivelAfluencia(jugadores: number): NivelAfluencia {}
const manejarGuardar = () => {};

// ❌ Así no
const data = [];                 // inglés y no dice qué es
const isLoading = true;          // inglés → cargando
function getGames() {}           // inglés → obtenerPartidos
const año = 2026;                // ñ → anio
type IPartido = {};              // sin prefijos → Partido
const calcProm = () => {};       // abreviatura → calcularPromedios
```

---

## 4. Capas: quién habla con quién

```text
Pantalla ──usa──► Store (Zustand) ──llama──► Servicio ──habla con──► Firebase / AsyncStorage / NetInfo / módulos nativos
   │
   ├──usa──► Hook (estado local, p. ej. useFormulario)
   └──muestra──► Componentes (solo props y callbacks)

Cualquier capa puede usar: utilidades (puras), constantes y tipos.
```

| Capa | Puede importar | **No** puede importar |
|---|---|---|
| Pantallas | componentes, hooks, stores, utilidades, constantes, tipos | servicios, `firebase/*`, AsyncStorage |
| Componentes | otros componentes, constantes, tipos, utilidades | stores, servicios, navegación |
| Hooks | utilidades, constantes, tipos; un servicio solo si la spec de la feature lo dice | componentes, pantallas, Firebase directo |
| Stores | servicios, utilidades, constantes, tipos | componentes, pantallas, Firebase directo |
| Servicios | `firebase/*`, AsyncStorage, NetInfo, módulos `expo-*`, utilidades, constantes, tipos | stores, pantallas, componentes |
| Utilidades | constantes, tipos | todo lo demás |

**Excepciones (y solo estas):**

1. `src/utilidades/errores.ts` importa `FirebaseError` para leer `error.code` (02-data-model, CAD29).
2. Los componentes **visuales** nativos (por ejemplo `MapView` de `react-native-maps`) se usan en pantallas o componentes, porque son UI.
3. Una pantalla puede usar `useNetInfo` **solo** para mostrar el aviso de "Sin conexión" (02-data-model). La revisión antes de hablar con Firebase siempre es `verificarConexion()` en el servicio.

**Por qué:** si mañana cambia el backend, solo cambia `servicios/`. Y en la defensa puedes señalar el único archivo que habla con Firestore.

```tsx
// ❌ Así no: la pantalla habla con Firestore
import { addDoc, collection } from 'firebase/firestore';

// ✅ Así sí: la pantalla le pide al store, el store al servicio
const guardarPartido = useStorePartidos((estado) => estado.guardarPartido);
```

---

## 5. TypeScript

- **`strict: true`** (ya viene en la plantilla `blank-typescript`). No se desactiva.
- **`type`, nunca `interface`.** La clase enseña los dos; aquí se usa uno solo (02-data-model).
- **Prohibido `any`**, incluido `as any` y `@ts-ignore`. Si no sabes el tipo, es `unknown` y se revisa antes de usarlo. El `error` de un `catch` ya es `unknown`.
- **Uniones de textos en lugar de `enum`:** `type ResultadoPartido = 'gano' | 'perdio'`.
- **`null` = "no hay"** (`idCancha: string | null`); `undefined` solo para props o parámetros opcionales. **Nunca** el `!` para "confiar" en que algo existe: se revisa con un `if`.
- **`as` solo en dos casos documentados:** `as const` en `tema.ts` y la conversión `documento.data() as DatosPartido` dentro de los servicios (02-data-model explica por qué es segura).
- **`useState` con lista vacía lleva su tipo:** `useState<Partido[]>([])` (si no, TypeScript lo deja como `never[]`).
- **Funciones de `servicios/` y `utilidades/` declaran lo que devuelven.** Ayuda a leerlas en la defensa.
- **Tipos "de utilidad" permitidos:** los que ya explican las specs (`Omit`, `Record`, `Partial`, `CompositeScreenProps`) y el genérico de `useFormulario`. Nada más avanzado.

```ts
// ✅ Así sí
export function minutosRestantes(checkIn: CheckIn, ahora: Date): number { /* ... */ }

const cancha = buscarCancha(idCancha);
if (cancha === undefined) {
  return <VistaError mensaje="No encontramos esta cancha" />;
}

// ❌ Así no
const cancha = buscarCancha(idCancha)!;          // "confía en mí" → truena si no existe
navigation.navigate('DetalleCancha' as any);     // apaga justo la revisión que nos protege
```

### Navegación

- Los tipos viven en `src/navegacion/tipos.ts` (01-navigation): `ParametrosStackRaiz`, `ParametrosTabs` y `PropsPantalla*`.
- Cada pantalla se tipa con su `PropsPantalla*`. Entre pantallas **solo viajan ids** (`idCancha`, `idPartido`).

```tsx
// ✅ Así sí
navigation.navigate('DetalleCancha', { idCancha: cancha.idCancha });

// ❌ Así no
navigation.navigate('DetalleCancha', { cancha });   // objeto completo: queda viejo si cambia
navigation.push('DetalleCancha', { idCancha });     // doble toque abre dos pantallas (01-navigation E10)
```

---

## 6. Componentes y pantallas

- **Componentes funcionales con `FC`**, como en la clase *TypeScript Básico*, y **exportación con nombre**. Única excepción: `App.tsx` usa `export default`, como en la plantilla.
- **Props con un `type`** arriba del componente, en el mismo archivo.
- **Todos los hooks arriba**, antes de cualquier `return` (regla de los hooks de React).
- **Condiciones en JSX siempre booleanas:** `{lista.length > 0 && ...}`, no `{lista.length && ...}` (un `0` se dibujaría en pantalla).
- **Orden del archivo:** imports → tipos → componente → estilos.
- **Orden de imports**, separados por una línea en blanco: 1) `react` y `react-native`, 2) otras librerías, 3) nuestros archivos con rutas relativas (`../componentes/VistaError`). Los imports que solo traen tipos usan `import type`.
- **Si un archivo pasa de ~150 líneas, se divide.** Si la misma pieza aparece en dos pantallas, se vuelve componente.
- **Cada pantalla en su archivo de `src/pantallas/`.** Nunca se declara dentro de un navegador ni con `component={() => ...}` (01-navigation, CA24).

**Componentes compartidos ya definidos:** `VistaCargando`, `VistaError` (mensaje + botón opcional) y `VistaVacia` (mensaje). Los de formulario (por ejemplo un botón principal o un campo de texto con su error) se crean cuando el primer formulario (F01) los necesite.

```tsx
// src/componentes/VistaError.tsx
import type { FC } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colores, espaciado, radio, tipografia } from '../constantes/tema';

type PropsVistaError = {
  mensaje: string;
  textoBoton?: string;
  alPresionarBoton?: () => void;
};

// Pantalla de error compartida: mismo aspecto en toda la app
export const VistaError: FC<PropsVistaError> = ({ mensaje, textoBoton = 'Reintentar', alPresionarBoton }) => {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.mensaje}>{mensaje}</Text>
      {alPresionarBoton !== undefined && (
        <TouchableOpacity style={estilos.boton} onPress={alPresionarBoton}>
          <Text style={estilos.textoBoton}>{textoBoton}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: espaciado.lg,
    backgroundColor: colores.fondo,
  },
  mensaje: {
    ...tipografia.cuerpo,
    color: colores.texto,
    textAlign: 'center',
    marginBottom: espaciado.md,
  },
  boton: {
    backgroundColor: colores.primario,
    borderRadius: radio,
    paddingVertical: espaciado.sm,
    paddingHorizontal: espaciado.lg,
  },
  textoBoton: {
    ...tipografia.cuerpo,
    color: colores.textoSobrePrimario,
  },
});
```

```tsx
// Pantalla: se tipa con sus props de navegación
export const PantallaDetalleCancha: FC<PropsPantallaDetalleCancha> = ({ navigation, route }) => {
  const cancha = buscarCancha(route.params.idCancha);
  // ...
};
```

---

## 7. Tema y estilos

Todo color, tamaño de letra, espaciado y radio sale de `src/constantes/tema.ts`. Los valores y su uso están en *Paleta y tipografía* de 01-navigation; los colores de afluencia (RN07) los agrega F02.

```ts
// src/constantes/tema.ts
// "as const" = estos valores no cambian; TypeScript los trata como fijos
export const colores = {
  primario: '#C2410C',
  textoSobrePrimario: '#FFFFFF',
  fondo: '#F7F7F5',
  superficie: '#FFFFFF',
  texto: '#1C1C1E',
  textoSecundario: '#6B6B70',
  inactivo: '#8E8E93',
  borde: '#E5E5EA',
  error: '#C62828',
  exito: '#2E7D32',
} as const;

export const tipografia = {
  titulo: { fontSize: 28, fontWeight: '700' },
  subtitulo: { fontSize: 20, fontWeight: '600' },
  cuerpo: { fontSize: 16, fontWeight: '400' },
  pequeno: { fontSize: 13, fontWeight: '400' },
} as const;

export const espaciado = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const radio = 12;
```

**Reglas**

- `StyleSheet.create` al final del archivo, en un objeto llamado `estilos`, con nombres en español (`contenedor`, `titulo`).
- Estilo en línea (`style={{ ... }}`) solo para valores que cambian en tiempo de ejecución, por ejemplo el color de un nivel de afluencia.
- Números permitidos fuera del tema: los de layout (`flex: 1`, `borderWidth: 1`, porcentajes). Todo lo que sea una decisión de diseño va al tema.
- Fuente del sistema; no se instalan fuentes.
- Nada de medidas fijas de pantalla (`width: 390`): se usa Flexbox, como en la clase *StyleSheet y Flexbox*.

```ts
// ✅ Así sí
titulo: { ...tipografia.subtitulo, color: colores.texto, marginBottom: espaciado.sm },

// ❌ Así no
titulo: { fontSize: 20, color: '#1C1C1E', marginBottom: 10 },
```

---

## 8. Estado global con Zustand

**¿`useState` o store?**

- `useState` si el dato solo lo usa una pantalla y se puede perder al salir (texto de un buscador, un modal abierto).
- Store si lo usan dos o más pantallas, viene de Firebase o debe sobrevivir al navegar (sesión, check-ins, partidos).

**Forma de cada store con datos:** los datos, `cargando: boolean`, `mensajeError: string | null`, las acciones (verbos) y `limpiar()`, que deja el store como nuevo al cerrar sesión (02-data-model: "cerrar sesión de verdad").

```ts
// src/stores/useStorePartidos.ts — ejemplo ilustrativo; cada feature define su store
import { create } from 'zustand';

import { obtenerTodosLosPartidos } from '../servicios/servicioPartidos';
import type { Partido } from '../tipos/partido';
import { obtenerMensajeError } from '../utilidades/errores';

type EstadoPartidos = {
  partidos: Partido[];
  cargando: boolean;
  mensajeError: string | null;
  cargarPartidos: (idUsuario: string) => Promise<void>;
  limpiar: () => void;
};

export const useStorePartidos = create<EstadoPartidos>((set) => ({
  partidos: [],
  cargando: false,
  mensajeError: null,

  cargarPartidos: async (idUsuario) => {
    set({ cargando: true, mensajeError: null });
    try {
      const partidos = await obtenerTodosLosPartidos(idUsuario);
      set({ partidos, cargando: false });
    } catch (error) {
      console.error('cargarPartidos:', error); // detalle técnico, solo para el programador
      set({ cargando: false, mensajeError: obtenerMensajeError(error) }); // mensaje en español
    }
  },

  limpiar: () => set({ partidos: [], cargando: false, mensajeError: null }),
}));
```

- **Leer con selector:** `const partidos = useStorePartidos((estado) => estado.partidos);` La pantalla solo se vuelve a dibujar cuando cambia ese dato.
- **Acciones que la pantalla necesita saber si salieron bien** (guardar, eliminar) devuelven `Promise<boolean>`: `true` si se guardó, `false` si falló (el mensaje queda en `mensajeError`). Así la pantalla decide si cierra el modal.

---

## 9. Estados de pantalla

Toda pantalla que carga datos revisa los estados **en este orden** y usa los componentes compartidos, para que se vean siempre igual:

```tsx
if (cargando) {
  return <VistaCargando />;
}
if (mensajeError !== null) {
  return <VistaError mensaje={mensajeError} alPresionarBoton={recargar} />;
}
if (partidos.length === 0) {
  return <VistaVacia mensaje="Aún no registras partidos" />;
}
return <FlatList data={partidos} /* ... */ />;
```

**Casos especiales ya definidos en las specs** (se respetan, no se reinventan):

- **Historial y Perfil sin internet** (RN11): si hay caché, se muestran los datos con el aviso "Sin conexión — datos guardados el…" en lugar de `VistaError`. `null` (nunca se descargó) no es lo mismo que lista vacía (02-data-model).
- **Mapa sin internet:** las canchas sí se ven, pero sin número de jugadores. **Nunca** se muestra "Vacía" (sería mentir).
- **Lista paginada** (F06): `cargando` es la primera carga; el indicador de "cargando más" lo define F06.
- **Ids que no existen** (01-navigation E1–E3): `VistaError` con su texto y su botón.

---

## 10. Errores, conexión y permisos

| Capa | Qué hace con los errores |
|---|---|
| Servicio | Llama a `verificarConexion()` antes de Firebase y **lanza** el error. No muestra nada |
| Store | `try/catch`: `console.error` con el detalle técnico y `obtenerMensajeError(error)` para el usuario |
| Pantalla | Muestra `mensajeError` (`VistaError`, texto en `colores.error` o `Alert.alert`, según la spec de la feature) |

- Los mensajes son los de la tabla *Errores* de 02-data-model. El usuario **nunca** ve textos técnicos como `permission-denied`.
- `console.error` sí; `console.log` no se queda en el código.
- **Permisos de ubicación y cámara:** se piden desde el servicio correspondiente. Si se niegan, la pantalla explica para qué sirve el permiso y cómo activarlo en Ajustes, y deshabilita lo que dependa de él. La app nunca se cierra ni se queda en blanco (01-navigation E9; 02-data-model E20–E21).

```ts
// ✅ Así sí
} catch (error) {
  console.error('crearCheckIn:', error);
  set({ mensajeError: obtenerMensajeError(error) });
}

// ❌ Así no
} catch (error) {}                       // el error desaparece y el usuario no sabe qué pasó
} catch (error) { Alert.alert(String(error)); }   // mensaje técnico en inglés
```

---

## 11. Formularios

Como en las clases *Validación de Formularios* y *Custom Hook de Formulario*: **validaciones manuales** + un **custom hook** que maneja valores, errores, campos tocados y envío. No se usan Formik ni Yup.

### Validaciones: funciones puras

- Viven en `src/utilidades/validaciones<Tema>.ts` (02-data-model las define).
- Reciben el valor (texto con `trim()`) y devuelven el **mensaje de error** o `null`.
- Si dependen de la fecha, la reciben como parámetro (`hoy`), para que el test dé siempre lo mismo.
- Se prueban con Jest sin simular nada.
- El objeto de errores de un formulario usa **los mismos nombres de campo** que sus valores: `Partial<Record<keyof Valores..., string>>`. Así encaja con `useFormulario` y con los campos tocados.
- Si un mensaje abarca dos campos (el marcador del partido), se guarda en el primero (`marcadorPropio`) y se muestra **una vez**, debajo de los dos, cuando cualquiera de los dos está tocado (02-data-model).

### `useFormulario` (`src/hooks/useFormulario.ts`)

Es el `useForm` de la clase con nombres en español y **sin `any`**:

| Devuelve | Equivale en clase a | Para qué |
|---|---|---|
| `valores` | `values` | Lo que escribió el usuario |
| `errores` | `errors` | Un mensaje por campo con error |
| `tocados` | `touched` | Campos que el usuario ya dejó |
| `enviando` | `isSubmitting` | Deshabilita botón y campos mientras se guarda |
| `manejarCambio(campo)` | `handleChange` | Para `onChangeText` |
| `manejarSalida(campo)` | `handleBlur` | Para `onBlur`: marca tocado y valida |
| `manejarEnvio()` | `handleSubmit` | Marca todo como tocado, valida y, si no hay errores, llama a `alEnviar` |
| `reiniciar()` | `reset` | Vuelve a los valores iniciales |

```ts
type OpcionesFormulario<T> = {
  valoresIniciales: T;
  validar: (valores: T) => Partial<Record<keyof T, string>>;
  alEnviar: (valores: T) => Promise<void>;
};

export function useFormulario<T extends object>({ valoresIniciales, validar, alEnviar }: OpcionesFormulario<T>) {
  // ... igual que en clase

  // T[K] = "el tipo de ese campo". Así no hace falta any (la clase usa value: any)
  const manejarCambio = <K extends keyof T>(campo: K) => (valor: T[K]) => {
    // ...
  };
  // ...
}
```

**Reglas de uso**

- El error de un campo se muestra **solo si está tocado** (como en clase).
- El botón de guardar se deshabilita con `enviando`. Esto evita guardar dos veces con un doble toque (02-data-model E10).
- `alEnviar` llama a la acción del store, nunca al servicio directo.
- El formulario va dentro de `KeyboardAvoidingView` con `behavior="padding"` en iOS (clase *Custom Hook de Formulario*).
- Lo que escribe el usuario siempre es texto; se convierte a número **después** de validar (`convertirAPartido`, 02-data-model).

```tsx
const formulario = useFormulario<ValoresFormularioPartido>({
  valoresIniciales,
  validar: (valores) => validarPartido(valores, obtenerFechaHoy(new Date())),
  alEnviar: async (valores) => {
    const guardado = await guardarPartido(convertirAPartido(valores));
    if (guardado) {
      navigation.goBack();
    }
  },
});
```

---

## 12. Testing

**Herramientas:** Jest + `jest-expo` + React Native Testing Library (00-project). La configuración es la task D6 de 02-data-model.

### Dónde y cómo se nombran

- **Junto al archivo que prueban:** `src/utilidades/promedios.ts` → `src/utilidades/promedios.test.ts`.
- `describe` con el nombre de la función o pantalla; `it` con una frase en español de lo que debe pasar.
- Los tests de integración empiezan su `describe` con **"Integración —"**, para contarlos fácil.
- Cada test cita el criterio de aceptación que comprueba (`// CAD24`).

### Qué se prueba (12 unitarios + 4 de integración)

| Tipo | Qué | De dónde salen |
|---|---|---|
| Unitario | Funciones puras de `utilidades/` y `servicioCache` con AsyncStorage simulado | CAD16–CAD27 de 02-data-model (12 criterios, mínimo un `it` cada uno) |
| Integración | Una pantalla o navegador con stores reales y **servicios simulados** | 1: N9 de 01-navigation. Los otros 3 los declara la spec de la feature que los aporte |

Las reglas de Firestore **no** se prueban con Jest: se prueban en el Rules Playground de la consola (CAD01–CAD05).

### Unitario

```ts
// src/utilidades/afluencia.test.ts
import { obtenerNivelAfluencia } from './afluencia';

// CAD24 — RN07
describe('obtenerNivelAfluencia', () => {
  it('devuelve "vacia" con 0 jugadores', () => {
    expect(obtenerNivelAfluencia(0)).toBe('vacia');
  });

  it('cambia de "poca" a "reta" entre 5 y 6 jugadores', () => {
    expect(obtenerNivelAfluencia(5)).toBe('poca');
    expect(obtenerNivelAfluencia(6)).toBe('reta');
  });
});
```

### Integración

```tsx
// src/navegacion/NavegadorRaiz.test.tsx — N9
import { NavigationContainer } from '@react-navigation/native';
import { render, screen } from '@testing-library/react-native';

import { useStoreSesion } from '../stores/useStoreSesion';
import { NavegadorRaiz } from './NavegadorRaiz';

// Un test nunca habla con Firebase: se reemplaza el servicio por uno falso.
// Las funciones reales del servicio de sesión las define F01.
jest.mock('../servicios/servicioSesion', () => ({}));

describe('Integración — NavegadorRaiz', () => {
  it('sin usuario muestra "Iniciar sesión"', () => {
    // El store se "simula" poniéndole el estado que queremos probar
    useStoreSesion.setState({ usuario: null, revisandoSesion: false });

    render(
      <NavigationContainer>
        <NavegadorRaiz />
      </NavigationContainer>,
    );

    expect(screen.getAllByText('Iniciar sesión').length).toBeGreaterThan(0);
  });
});
```

### Cómo simular

| Qué | Cómo |
|---|---|
| Un servicio | `jest.mock('../servicios/servicioX', () => ({ funcion: jest.fn() }))` **con fábrica**, para que nunca se cargue Firebase. Se programa la respuesta con `jest.mocked(funcion).mockResolvedValue(...)` (o `mockRejectedValue` para probar errores) |
| Un store | `useStoreX.setState({...})` en cada test, porque el store guarda su estado entre tests |
| AsyncStorage | Una vez en `jest.setup.ts` con el simulador oficial: `jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'))` |
| La fecha | Se pasa como parámetro (`hoy`, `ahora`); no hace falta simular el reloj |

---

## 13. Comentarios

- **El porqué, no el qué.** El código ya dice qué hace.
- **Cada función de `servicios/` y `utilidades/` lleva un JSDoc corto** (qué hace, qué recibe, qué puede fallar).
- **Se cita la regla o caso que implementa:** `RN03`, `F05`, `E10`, `CAD24`.
- **Cuando algo puede sonar "avanzado"** (`Record`, `Omit`, `T[K]`, `CompositeScreenProps`), una línea que lo explique en palabras sencillas.
- **Cuando nos apartamos de la clase**, una línea que diga a qué equivale y por qué.
- **Código provisional** se marca y se quita antes de cerrar la feature: `// PROVISIONAL (N7): se quita cuando F02 ponga los marcadores`.
- Nada de código comentado: para recuperarlo está Git.

```ts
// ✅ Así sí
/**
 * Escribe el check-in del usuario en la cancha indicada.
 * RN03: el id del documento es el uid, así que setDoc reemplaza el anterior.
 * No revisa la distancia (RN02); eso lo hace F03 antes de llamarla.
 * @throws Error('sin-conexion') o un FirebaseError
 */
export async function crearCheckIn(idUsuario: string, idCancha: string): Promise<void> {}

// Se usa la hora local y no toISOString(): en Ensenada, después de las 4–5 p. m.,
// toISOString() ya marca el día siguiente (02-data-model, Fechas)

// ❌ Así no
// suma 1 al contador
contador = contador + 1;
```

---

## 14. Dependencias

- **Siempre con `npx expo install <paquete>`**: elige versiones compatibles con Expo Go. Las de desarrollo: `npx expo install <paquete> -- --save-dev`.
- **Solo las que aparecen en *Decisiones técnicas* de 00-project.** Una nueva se propone primero en la spec (con su porqué) y luego se instala.
- Se prefieren módulos de Expo y lo que ya trae la plantilla (`@expo/vector-icons`).

| Para qué | Paquete(s) | Dónde se decidió |
|---|---|---|
| Navegación | `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`, `react-native-screens`, `react-native-safe-area-context` | 01-navigation N1 |
| Estado global | `zustand` | 00-project |
| Backend | `firebase` | 00-project, 02-data-model D2 |
| Persistencia | `@react-native-async-storage/async-storage` | 02-data-model D2 |
| Conectividad | `@react-native-community/netinfo` | 02-data-model D8 |
| Mapa y ubicación | `react-native-maps`, `expo-location` | 00-project |
| Foto y tarjeta | `expo-image-picker`, `react-native-view-shot`, `expo-sharing` | 00-project |
| Iconos | `@expo/vector-icons` (ya viene) | 01-navigation |
| Tests (desarrollo) | `jest-expo`, `jest`, `@testing-library/react-native` | 00-project, 02-data-model D6 |
| Lint (desarrollo) | ESLint con la configuración de Expo (lo instala `npx expo lint`) | Este documento |

---

## 15. Variables de entorno y datos privados

- Las variables van en `.env` con prefijo `EXPO_PUBLIC_` y nombres en español cuando son nuestras (`EXPO_PUBLIC_CANCHA_PRUEBA_LAT`). La lista está en 02-data-model.
- **`.env` nunca se sube.** Se sube `.env.example` con las mismas claves y **sin valores**.
- Se leen solo en dos lugares: `src/servicios/firebase.ts` y `src/constantes/canchas.ts`.
- Expo solo reemplaza la variable si se escribe completa: `process.env.EXPO_PUBLIC_FIREBASE_API_KEY`. No se desestructura (`const { ... } = process.env` no funciona).
- Después de cambiar `.env`, se reinicia `npx expo start`.
- **Nada privado en código, specs, commits ni capturas:** coordenadas de tu casa, contraseñas, correos reales. El repositorio es público.
- La llave de Firebase termina dentro de la app, así que no es un secreto; lo que protege los datos son las reglas de Firestore (02-data-model). Igual va en `.env`.
- Si algo privado llega a un commit, borrarlo después **no** lo quita del historial (clase *Git y Deploy*): se cambia el dato o se revoca la llave.

---

## 16. Herramientas de calidad

| Herramienta | Comando | Cuándo |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | Antes de cada commit |
| ESLint (configuración de Expo) | `npx expo lint` | Antes de cada commit. La primera vez instala ESLint y crea `eslint.config.js`, que sí se sube |
| Prettier | Formato al guardar en el editor | Siempre |
| Tests | `npx jest` | Antes de cada commit, desde que Jest está configurado (task D6 de 02-data-model) |
| Cobertura | `npx jest --coverage` | Al final, para el reporte que pide el checklist de entrega |

**Prettier** se usa como extensión de VS Code (no se instala como paquete), con "Format on Save" activado y este `.prettierrc` en la raíz:

```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all",
  "printWidth": 100,
  "endOfLine": "auto"
}
```

`"endOfLine": "auto"` evita que Prettier marque todas las líneas como cambiadas por los finales de línea de Windows.

No se desactivan reglas de ESLint con comentarios (`// eslint-disable`). Si una regla estorba, se entiende por qué antes de cambiar el código.

---

## 17. Git

**Flujo** (clase *Git y Deploy*): se trabaja **solo en `main`**.

```bash
git status                 # ¿qué cambió? Siempre antes de commitear
git diff                   # revisar línea por línea lo que vas a commitear
git add src/utilidades/afluencia.ts src/utilidades/afluencia.test.ts
git commit -m "agrega cálculo del nivel de afluencia (D10)"
git push
```

**Mensaje de commit**

- En español y en el estilo de la clase: empieza con el verbo (`agrega`, `corrige`, `extrae`, `conecta`, `quita`, `actualiza`).
- **Una sola idea**: si necesitas la palabra "y", son dos commits.
- Dice qué cambió, sin mencionar herramientas.
- Termina con el **id de la task** entre paréntesis. Si es una spec, con el nombre de la spec.
- Si cambia un archivo que no es task ni spec (este estándar, `CLAUDE.md`, el README, `.gitignore`), termina con el **nombre de ese archivo**; si es `.md`, sin la extensión, igual que las specs.
- Ids de task: las specs base usan los suyos (`N1`, `D7`); las specs de features numeran sus tasks con el id de la feature (`F03.1`, `F03.2`…).

```text
✅ agrega dependencias de navegación (N1)
✅ crea las 8 pantallas provisionales (N4)
✅ corrige la fecha de hoy después de las 4 p. m. (D7)
✅ escribe la spec de navegación (01-navigation)
✅ reemplaza AGENTS.md por CLAUDE.md (CLAUDE)
✅ agrega coverage al .gitignore (.gitignore)

❌ cambios
❌ ya jala!!!
❌ agrega tabs y arregla colores y cambia headers     ← son tres commits
❌ lo que me dijo la IA
```

**Tamaño y ritmo**

- Una task de la spec ≈ un commit.
- Mínimo **3 commits por semana**, con fecha real (clase *Git y Deploy*). Nunca un commit gigante la noche antes.
- Antes de commitear: `npx tsc --noEmit`, `npx expo lint` y `npx jest` sin errores (`npx jest` desde la task D6).

**Reglas**

- `.gitignore` listo **antes** del primer commit: además de lo que trae la plantilla, `.env` y `coverage/`.
- Para deshacer algo ya subido: `git revert <commit>`. Nunca `git push --force` ni reescribir el historial: el profesor lo revisa en la defensa.
- **Los commits los haces tú**, no Claude Code: revisas el diff, entiendes cada línea y commiteas. Así puedes defender cualquier commit.

---

## 18. Prohibido

**En el código**

- `any`, `as any`, `@ts-ignore`, el `!` para "confiar" en un valor, `interface`, `enum`.
- Importar Firebase, AsyncStorage o NetInfo fuera de `src/servicios/` (salvo las excepciones de la sección 4).
- Colores, tamaños de letra o espaciados escritos a mano fuera de `tema.ts`.
- Declarar una pantalla dentro de un navegador o con `component={() => ...}`.
- Pasar objetos completos entre pantallas, o usar `push` donde va `navigate`.
- Mostrar al usuario mensajes técnicos o en inglés; un `catch` vacío.
- Dejar una pantalla en blanco o que la app se cierre por un permiso negado, falta de internet o un id que no existe.
- `console.log`, código comentado o código provisional al cerrar una feature.
- `toISOString()` para la fecha de un partido (02-data-model).
- `// eslint-disable`.
- Datos privados en código, specs o commits.
- Herramientas fuera de 00-project: Expo Router, Redux, Context para estado global, Formik, Yup, librerías de componentes de UI, fuentes instaladas.
- Patrones avanzados "por si acaso": HOCs, `useReducer` innecesario, `React.memo`/`useMemo`/`useCallback` sin una razón medida, genéricos más allá de `useFormulario`.

**Para Claude Code**

- Implementar algo sin spec, más de una task a la vez, o funcionalidades que la spec no pide (se proponen como texto).
- Inventar requisitos: si la spec es ambigua o contradice el código, pregunta.
- Instalar paquetes sin preguntar, o con `npm install` en lugar de `npx expo install`.
- Hacer commits o `push`.
- Cambiar una spec sin proponer el cambio primero.
- "Arreglar" un error de TypeScript o ESLint apagando la revisión (`any`, `@ts-ignore`, `eslint-disable`).

---

## 19. Definición de terminado

Una task o feature está terminada cuando:

- [ ] Sus criterios de aceptación se probaron en el iPhone con Expo Go (o en Jest / la consola de Firebase, según diga el criterio).
- [ ] Contempla cargando, error, vacío, sin internet y permisos negados (los que le apliquen).
- [ ] `npx tsc --noEmit`, `npx expo lint` y `npx jest` (desde D6) pasan sin errores.
- [ ] No hay warnings en la consola de Expo (checklist de entrega).
- [ ] No hay `any`, `console.log`, código comentado ni código provisional.
- [ ] Sus tests están escritos junto con el código, no "para después".
- [ ] La spec está marcada (`[x]`) y actualizada si algo cambió.
- [ ] Puedes explicar cada archivo que se agregó o cambió.

**Quién marca qué en la spec**

- **La task** (`[x]` en *Tasks*): la marca Claude Code al terminar de implementarla.
- **Los criterios de aceptación** (CAxx, CADxx): los marcas tú, después de probarlos en el iPhone, en Jest o en la consola de Firebase, según diga el criterio. Los que dependen de otra feature se marcan cuando esa feature esté lista (como en la task N10 de 01-navigation).