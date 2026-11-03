# Modelo de datos — HoopsMap

> **Estado:** v1.0 · **Última actualización:** 2026-11-02
> **Depende de:** `specs/00-project.md` (RN01–RN11, *Cumplimiento de la rúbrica*, *Decisiones técnicas*) y `specs/01-navigation.md` (solo viajan `idCancha` e `idPartido`)
> **Clases de referencia:** [Persistencia Local y Almacenamiento Seguro](https://academy.alvesc.com/clase/persistencia-y-almacenamiento-seguro) · [Autenticación y Seguridad](https://academy.alvesc.com/clase/autenticacion-y-seguridad) · [Offline y Conectividad](https://academy.alvesc.com/clase/offline-y-conectividad)

---

## Objetivo

Definir **qué datos maneja HoopsMap, dónde vive cada uno y quién puede tocarlo**: las entidades (Cancha, Usuario, CheckIn, Partido), sus tipos de TypeScript, la estructura en Firestore, las 7 operaciones del backend que pide la rúbrica, las reglas de seguridad, la caché de AsyncStorage y las validaciones de un partido como funciones puras.

Esta spec **no** define pantallas: las features (F01–F07) usan lo que aquí se describe.

---

## Actor

- **Jugador con sesión:** crea y termina su check-in, y crea, consulta, edita y borra **sus** partidos.
- **Firebase (servidor):** guarda los datos y **decide qué se permite** con las reglas de seguridad.
- **La app (cliente):** valida antes de enviar y **decide qué se muestra**. Como dice la clase de Autenticación: *el frontend decide qué se muestra; el servidor decide qué se permite*.

---

## Precondiciones

- Proyecto de Firebase creado con **Authentication** (proveedor correo/contraseña) y **Firestore** (modo producción, que empieza negando todo).
- Variables de Firebase en `.env` con prefijo `EXPO_PUBLIC_` (ver *Variables de entorno*). `.env` nunca se sube; sí se sube `.env.example` vacío.
- Para todas las operaciones de Firestore el usuario tiene sesión (F01). El catálogo de canchas no necesita sesión ni internet (RN05).

---

## Datos de entrada

| Dato | De dónde viene | ¿Se guarda? | Dónde |
|---|---|---|---|
| Correo y contraseña | Formulario de registro / inicio de sesión (F01) | Correo sí; la contraseña **nunca** en la app (Firebase guarda su hash) | Firebase Auth |
| Nombre | Formulario de registro (F01) | Sí | Firebase Auth (`displayName`) |
| `idUsuario` | Firebase Auth (el `uid`) | Sí | Lo genera Firebase |
| Canchas (nombre y coordenadas) | Código de la app (RN05) | Ya está en el código | `src/constantes/canchas.ts` |
| Coordenadas de la cancha de prueba | `.env` (solo desarrollo, RN05) | No se escriben en el código | `.env` |
| Ubicación GPS del usuario | `expo-location` (F02/F03) | **No.** Solo se usa en el teléfono para revisar RN02 | Memoria |
| Cancha del check-in | Botón "Hacer check-in" (F03) | Sí | Firestore `checkins` |
| Datos del partido | Formulario de partido (F05) | Sí | Firestore `usuarios/{idUsuario}/partidos` |
| Foto de la tarjeta | Cámara o galería (F07) | **No.** Se usa para crear la imagen y compartirla | Memoria |

### Qué va dónde (tabla de la clase *Persistencia*)

| Dato | Dónde | Por qué |
|---|---|---|
| Canchas | Código (`canchas.ts`) | RN05: fijas, funcionan sin conexión |
| Usuario (uid, correo, nombre) | Firebase Auth | Ya lo maneja Firebase; no hace falta otra colección |
| Check-ins | Firestore | Otros usuarios necesitan verlos (por eso hay backend) |
| Partidos | Firestore | Se conservan aunque cambie de teléfono |
| Caché del historial | AsyncStorage | RN11: verlo sin internet; no es sensible |
| Sesión de Firebase | AsyncStorage (lo hace Firebase solo) | Decisión de 00-project (ver *Diferencias con lo visto en clase*) |
| Promedios | Memoria | Se calculan cada vez con una función pura |
| Contraseña | **No se guarda** | Para eso está la sesión |
| Ubicación del usuario y foto | **No se guardan** | RN06 (privacidad) y no hacen falta después |

---

## Flujo principal (ciclo de vida de los datos)

1. **Registro (F01):** Firebase Auth crea el usuario (`uid` + correo) y se guarda el nombre en `displayName`.
2. **Check-in (F03):** la app revisa RN02 con el GPS y, si está a 150 m o menos, escribe el documento `checkins/{idUsuario}` con la cancha y la hora del servidor.
3. **Mapa (F02):** la app pide los check-ins activos (creados hace menos de 90 min, RN01) y los convierte en **un número por cancha** (RN06). Con ese número calcula el nivel de afluencia (RN07).
4. **"Ya me voy" (F03, RN04):** se borra `checkins/{idUsuario}`.
5. **Registrar partido (F05):** el formulario valida con funciones puras y se crea un documento en `usuarios/{idUsuario}/partidos`.
6. **Historial (F06):** se descargan páginas de 10 partidos. Aparte se descargan **todos** los partidos para calcular los promedios; esa lista completa se guarda en AsyncStorage (RN11).
7. **Sin internet:** Historial y Perfil leen la caché, con aviso de cuándo se guardó. Crear, editar, borrar y hacer check-in se bloquean con un mensaje (RN11).
8. **Cerrar sesión (F01):** si hay check-in activo se termina (RN04); después se borra la caché del historial y se limpian los stores. Si no hay internet para terminar el check-in, la sesión se cierra igual y el check-in vence solo a los 90 min (RN01).

---

## Entidades

Los tipos viven en `src/tipos/`. Usan `type` (no `interface`) y **no importan nada de Firebase**: los servicios convierten los datos de Firebase a estos tipos. Así, si un día se cambia de backend, solo cambian los servicios.

Cada entidad nombra su id como `id` + nombre de la entidad (`idCancha`, `idUsuario`, `idPartido`), igual que los parámetros de navegación de `01-navigation.md`.

### Cancha — `src/tipos/cancha.ts`

Vive en el código, no en Firestore (RN05).

| Campo | Tipo | Obligatorio | Regla / por qué |
|---|---|---|---|
| `idCancha` | `string` | Sí | RN05. Texto corto en minúsculas con guiones (`'sullivan'`). Viaja entre pantallas (01-navigation) |
| `nombre` | `string` | Sí | RN05. Se muestra en el mapa y en el header del detalle |
| `latitud` | `number` | Sí | RN05. Marcador del mapa (F02) y distancia de RN02 (F03) |
| `longitud` | `number` | Sí | Igual que `latitud` |

```ts
export type Cancha = {
  idCancha: string;
  nombre: string;
  latitud: number;
  longitud: number;
};
```

**Catálogo (`src/constantes/canchas.ts`):** exporta `CANCHAS: Cancha[]` con las 7 canchas de la tabla de RN05.

**Cancha de prueba (solo desarrollo, RN05):**

- `idCancha: 'prueba'`, `nombre: 'Cancha de prueba'`.
- Latitud y longitud se leen de `EXPO_PUBLIC_CANCHA_PRUEBA_LAT` y `EXPO_PUBLIC_CANCHA_PRUEBA_LNG` y se convierten con `Number(...)`.
- Si falta alguna variable o no es un número válido (`Number.isNaN`), la cancha **no se agrega**.
- Sus coordenadas nunca aparecen en el código, en las specs ni en los commits.

**Función de apoyo (`src/utilidades/canchas.ts`):** `buscarCancha(idCancha: string): Cancha | undefined`. La usan F04 (caso E1 de navegación), F05 y las validaciones.

### Usuario — `src/tipos/usuario.ts`

Vive en **Firebase Auth**. No hay colección `usuarios` con datos personales en Firestore: el nombre se guarda en el `displayName` del usuario de Auth, que **otros usuarios no pueden leer**.

| Campo | Tipo | Obligatorio | Regla / por qué |
|---|---|---|---|
| `idUsuario` | `string` | Sí | Es el `uid` de Firebase Auth. Dueño de su check-in y sus partidos (RN03, RN10) |
| `correo` | `string` | Sí | Inicio de sesión (F01). Se muestra en Perfil |
| `nombre` | `string` | Sí (puede llegar vacío, ver E15) | Se pide en el registro. Se muestra en Perfil y en la tarjeta (F07) |

```ts
export type Usuario = {
  idUsuario: string; // uid de Firebase Auth
  correo: string;
  nombre: string; // displayName de Firebase Auth ('' si no se pudo guardar)
};
```

El servicio de sesión (F01) convierte el `User` de Firebase en `Usuario` con una función `convertirUsuario`. Las validaciones de correo y contraseña son de F01; la de `nombre` está en *Validaciones* de esta spec.

### CheckIn — `src/tipos/checkIn.ts`

Vive en Firestore, colección `checkins`.

**Lo que se guarda en Firestore** (documento `checkins/{idUsuario}`):

| Campo | Tipo en Firestore | Obligatorio | Regla / por qué |
|---|---|---|---|
| *(id del documento)* | uid del usuario | Sí | RN03: un documento por usuario = un check-in a la vez |
| `idCancha` | string | Sí | RN05: debe existir en el catálogo |
| `creadoEn` | Timestamp **del servidor** | Sí | RN01: desde aquí se cuentan los 90 min |

No se guarda la ubicación del usuario, ni su nombre, ni la hora de expiración (se calcula).

**Lo que usa la app:**

| Campo | Tipo | Regla / por qué |
|---|---|---|
| `idUsuario` | `string` | Es el id del documento |
| `idCancha` | `string` | RN05 |
| `creadoEn` | `Date` | RN01 |
| `expiraEn` | `Date` | RN01: `creadoEn` + 90 min. **Se calcula, no se guarda** |

```ts
export type CheckIn = {
  idUsuario: string;
  idCancha: string;
  creadoEn: Date;
  expiraEn: Date; // creadoEn + CHECK_IN_DURACION_MINUTOS (RN01), calculado en la app
};

// Niveles de RN07
export type NivelAfluencia = 'vacia' | 'poca' | 'reta' | 'llena';

// Lo que devuelve "obtener check-ins activos": solo números (RN06)
export type ResumenAfluencia = {
  jugadoresPorCancha: Record<string, number>; // llave: idCancha · valor: jugadores activos
  miCheckIn: CheckIn | null; // el check-in activo del usuario actual, o null
};
```

`Record<string, number>` se lee así: "un objeto cuyas llaves son textos (el `idCancha`) y cuyos valores son números". Por ejemplo `{ sullivan: 7, 'parque-morelos': 2 }`. Una cancha que no aparece tiene 0 jugadores.

### Partido — `src/tipos/partido.ts`

Vive en Firestore, en `usuarios/{idUsuario}/partidos/{idPartido}`.

| Campo | Tipo | Obligatorio | Regla / por qué |
|---|---|---|---|
| `idPartido` | `string` | Sí | Lo genera Firestore. Viaja entre pantallas (01-navigation) |
| `fecha` | `string` (`'AAAA-MM-DD'`) | Sí | RN09. Solo el día, hoy o antes (ver *Fechas*) |
| `idCancha` | `string \| null` | No (`null` = sin cancha) | RN09 (opcional) y RN05 (si viene, existe en el catálogo) |
| `resultado` | `'gano' \| 'perdio'` | Sí | RN09 |
| `puntos` | `number` (entero 0–100) | Sí | RN09, RN08 (autorreportado) |
| `rebotes` | `number` (entero 0–100) | Sí | RN09, RN08 |
| `asistencias` | `number` (entero 0–100) | Sí | RN09, RN08 |
| `marcadorPropio` | `number \| null` (entero 0–200) | No | RN09: marcador final opcional. Puntos de mi equipo |
| `marcadorRival` | `number \| null` (entero 0–200) | No | RN09. Puntos del equipo rival |

El dueño **no** se guarda como campo: está en la ruta del documento (`usuarios/{idUsuario}/...`).

```ts
export type ResultadoPartido = 'gano' | 'perdio';

export type Partido = {
  idPartido: string;
  fecha: string; // 'AAAA-MM-DD', día local del partido
  idCancha: string | null; // null = no eligió cancha
  resultado: ResultadoPartido;
  puntos: number;
  rebotes: number;
  asistencias: number;
  marcadorPropio: number | null; // null = sin marcador
  marcadorRival: number | null;
};

// Lo que se manda a Firestore al crear o editar: todo menos el id
export type DatosPartido = Omit<Partido, 'idPartido'>;
```

`Omit<Partido, 'idPartido'>` se lee: "un Partido sin el campo `idPartido`". Se usa al crear, porque el id todavía no existe.

**Tipos del formulario** (los usa F05 con el custom hook de formulario). Lo que escribe el usuario en un `TextInput` siempre es texto; se convierte a número **después** de validar.

```ts
export type ValoresFormularioPartido = {
  fecha: string;
  idCancha: string | null;
  resultado: ResultadoPartido | null; // null = todavía no elige
  puntos: string;
  rebotes: string;
  asistencias: string;
  marcadorPropio: string; // '' = vacío
  marcadorRival: string;
};

// Un mensaje por campo con error; si el campo no aparece, está bien
export type ErroresPartido = {
  fecha?: string;
  idCancha?: string;
  resultado?: string;
  puntos?: string;
  rebotes?: string;
  asistencias?: string;
  marcador?: string; // un solo mensaje para los dos campos del marcador
};
```

### Tipos derivados (no se guardan en Firestore)

```ts
// src/tipos/partido.ts
export type Promedios = {
  partidosJugados: number;
  victorias: number;
  puntos: number; // promedio por partido, 1 decimal
  rebotes: number;
  asistencias: number;
};

// Una página del historial (F06)
export type PaginaPartidos = {
  partidos: Partido[];
  cursor: CursorPartidos | null; // dónde continuar; null si no hay más
  hayMas: boolean;
};
```

`CursorPartidos` es el último documento que se leyó (un `QueryDocumentSnapshot` de Firestore). Es el **único** tipo de Firebase que sale del servicio: el store lo guarda tal cual y se lo regresa al servicio para pedir la siguiente página, sin leerlo. Se declara en `servicioPartidos.ts`.

---

## Estructura en Firestore

```text
Firestore
├── checkins/                       ← un documento por usuario (RN03)
│   └── {idUsuario}                 { idCancha, creadoEn }
│
└── usuarios/
    └── {idUsuario}/                ← "carpeta" del usuario (no guarda datos propios)
        └── partidos/               ← subcolección
            └── {idPartido}         { fecha, idCancha, resultado, puntos, rebotes,
                                      asistencias, marcadorPropio, marcadorRival }
```

### `checkins`: el id del documento es el uid (recomendación para RN03)

**Recomendación:** usar el **uid del usuario como id del documento**. Piénsalo como un casillero con el nombre de cada jugador: solo cabe un check-in.

- **Hacer check-in** = escribir en `checkins/{idUsuario}` con `setDoc`. Si ya había uno (en otra cancha o vencido), **se reemplaza**. Eso es RN03 sin código extra: no hay que buscar el anterior ni borrarlo.
- **Terminar check-in** (RN04) = borrar `checkins/{idUsuario}` con `deleteDoc`.
- **Check-in vencido** (RN01): el documento se queda en Firestore, pero ya no se cuenta porque su `creadoEn` es de hace más de 90 min. Se reemplaza en el siguiente check-in. No hace falta limpiarlo.

Alternativa descartada: ids automáticos + una transacción que busque y termine el check-in anterior. Funciona, pero es más código y más difícil de explicar.

### `partidos`: subcolección dentro de cada usuario

**Por qué subcolección y no una colección `partidos` con un campo `idUsuario`:**

- **Reglas más simples (RN10):** el dueño está en la ruta, así que la regla es "solo si tu uid es el de la carpeta".
- **Sin índices extra:** para el historial basta `orderBy('fecha', 'desc')`. Con una colección general haría falta `where('idUsuario', '==', ...)` + `orderBy('fecha')`, que obliga a crear un índice compuesto en la consola.
- **Fácil de explicar:** "cada usuario tiene su carpeta de partidos".

`idPartido` lo genera Firestore con `addDoc` (un id aleatorio). El documento `usuarios/{idUsuario}` no necesita existir: Firestore permite subcolecciones dentro de documentos vacíos.

---

## Fechas y tiempos

### Check-in (RN01)

| Qué | Cómo | Por qué |
|---|---|---|
| `creadoEn` | `serverTimestamp()` de Firestore | Usa la hora **del servidor**, no la del teléfono. Si alguien cambia la hora de su iPhone, su check-in no dura más. La regla de seguridad lo exige (`== request.time`) |
| `expiraEn` | `calcularExpiracion(creadoEn)` = `creadoEn` + 90 min | Un solo dato guardado; la expiración se deduce. Si RN01 cambia, solo cambia la constante |
| ¿Está activo? | Consulta `where('creadoEn', '>', límite)` con límite = `calcularLimiteActivos(ahora)` = ahora − 90 min | Firestore solo devuelve los vigentes |
| Minutos restantes | `minutosRestantes(checkIn, ahora)` | Para mostrar "Te quedan 35 min" (F03) |

**Limitación conocida:** el límite de la consulta se calcula con el reloj del teléfono. Si el reloj está muy desfasado, el conteo se mueve esos mismos minutos. El iPhone pone la hora automáticamente, así que es aceptable para el MVP.

### Partido (RN09)

- `fecha` es **texto `'AAAA-MM-DD'`** con el día **local** (Ensenada). No guarda horas.
- **Por qué texto y no `Timestamp`:** no hay zonas horarias de por medio, se guarda igual en Firestore y en AsyncStorage (JSON), y se ordena bien como texto (`'2026-11-02' > '2026-10-30'`).
- **Trampa clásica que evitamos:** `new Date().toISOString()` da la fecha en UTC. En Ensenada, después de las 4–5 p. m. ya marca **el día siguiente**. Por eso `obtenerFechaHoy` arma el texto con `getFullYear()`, `getMonth() + 1` y `getDate()`, que usan la hora local.
- Partidos del mismo día: se ordenan por fecha y, entre ellos, Firestore desempata por id (orden estable pero no cronológico). Aceptable para el MVP.
- Mostrar la fecha bonita ("2 nov 2026") lo define F06.

### Caché

- `guardadoEn` es `new Date().toISOString()`: un instante exacto, sirve para el aviso "Datos guardados el 2 nov, 18:40".

---

## Conteo de jugadores sin exponer quiénes son (RN06, RN07)

1. `obtenerCheckInsActivos` lee los check-ins vigentes.
2. **Dentro del servicio** se separa el del usuario actual (`miCheckIn`) y del resto **solo se toma el `idCancha`**. Los uids de los demás no salen del servicio.
3. `contarJugadoresPorCancha(idsCancha)` convierte la lista de canchas en números. Ejemplo: `['sullivan', 'sullivan', 'siglo-xxi']` → `{ sullivan: 2, 'siglo-xxi': 1 }`.
4. Las pantallas reciben solo `ResumenAfluencia` (números + mi check-in). Nunca nombres, nunca ubicaciones (RN06).
5. `obtenerNivelAfluencia(jugadores)` aplica RN07:

| Jugadores | Resultado |
|---|---|
| 0 | `'vacia'` |
| 1–5 | `'poca'` |
| 6–9 | `'reta'` |
| 10 o más | `'llena'` |

El check-in propio **sí cuenta** en su cancha (el usuario está jugando ahí).

**Límite honesto para la defensa:** las reglas permiten que cualquier usuario con sesión lea la colección `checkins` (si no, no se podría contar). Alguien que manipule la app podría ver uids y la cancha de cada uno. Un uid es un texto aleatorio: no da nombre (el nombre está en Auth y nadie más lo lee) ni ubicación (nunca se guarda). Esconderlo del todo requiere Cloud Functions, que está fuera del MVP.

---

## Operaciones del backend (servicios)

Los servicios viven en `src/servicios/` y son el **único** lugar que importa Firebase y AsyncStorage. Todas son `async` y, si algo falla, **lanzan un error** que el store atrapa con `try/catch` y convierte en mensaje con `obtenerMensajeError` (ver *Errores*).

**Regla común:** antes de hablar con Firebase, cada operación llama a `verificarConexion()`. Si no hay internet, lanza el error `'sin-conexion'` de inmediato. Así se evita el "spinner eterno": sin conexión, Firestore deja una escritura esperando sin responder.

### Las 7 operaciones de la rúbrica

| # | Función | Archivo | Recibe | Devuelve | Firestore | Regla |
|---|---|---|---|---|---|---|
| 1 | `crearCheckIn` | `servicioCheckIns.ts` | `idUsuario`, `idCancha` | `Promise<void>` | `setDoc(checkins/{idUsuario}, { idCancha, creadoEn: serverTimestamp() })` | RN01, RN03, RN05 |
| 2 | `terminarCheckIn` | `servicioCheckIns.ts` | `idUsuario` | `Promise<void>` | `deleteDoc(checkins/{idUsuario})` | RN04 |
| 3 | `obtenerCheckInsActivos` | `servicioCheckIns.ts` | `idUsuario` | `Promise<ResumenAfluencia>` | `getDocs(query(checkins, where('creadoEn', '>', límite)))` | RN01, RN06, RN07 |
| 4 | `crearPartido` | `servicioPartidos.ts` | `idUsuario`, `datos: DatosPartido` | `Promise<Partido>` | `addDoc(usuarios/{idUsuario}/partidos, datos)` | RN09, RN10 |
| 5 | `obtenerPaginaPartidos` | `servicioPartidos.ts` | `idUsuario`, `cursor: CursorPartidos \| null` | `Promise<PaginaPartidos>` | `getDocs(query(partidos, orderBy('fecha', 'desc'), startAfter(cursor), limit(10)))` | RN10, F06 |
| 6 | `editarPartido` | `servicioPartidos.ts` | `idUsuario`, `idPartido`, `datos: DatosPartido` | `Promise<Partido>` | `updateDoc(usuarios/{idUsuario}/partidos/{idPartido}, datos)` | RN09, RN10 |
| 7 | `eliminarPartido` | `servicioPartidos.ts` | `idUsuario`, `idPartido` | `Promise<void>` | `deleteDoc(usuarios/{idUsuario}/partidos/{idPartido})` | RN10 |

**Operación de apoyo (no cuenta para las 7):**

| Función | Recibe | Devuelve | Para qué |
|---|---|---|---|
| `obtenerTodosLosPartidos` | `idUsuario` | `Promise<Partido[]>` | Promedios del Perfil (F06) y caché sin conexión (RN11). Misma consulta que la 5 sin `limit` |

### Detalles de cada operación

**1. `crearCheckIn`** — **No revisa la distancia** (RN02): eso lo hace F03 con el GPS antes de llamarla. Devuelve `void` porque la hora real la pone el servidor; después de crear, F03 vuelve a llamar a `obtenerCheckInsActivos` para mostrar el conteo y el tiempo restante.
Errores: `'sin-conexion'`, `permission-denied` (no es su documento o el `idCancha` no está en las reglas), `unavailable`.

**2. `terminarCheckIn`** — Borrar un documento que no existe no da error, así que tocar "Ya me voy" con el check-in ya vencido funciona igual.
Errores: `'sin-conexion'`, `permission-denied`, `unavailable`.

**3. `obtenerCheckInsActivos`** — Recorre los documentos: si el id es el del usuario, lo convierte en `miCheckIn` (con `expiraEn` calculado); de los demás solo toma `idCancha`. Luego usa `contarJugadoresPorCancha`.
Errores: `'sin-conexion'`, `unavailable`, `permission-denied` (sesión vencida).

**4. `crearPartido`** — Recibe datos **ya validados** (F05 llama antes a `validarPartido`). Devuelve el partido con su nuevo `idPartido`.
Errores: `'sin-conexion'`, `permission-denied` (datos que no pasan las reglas o no es su carpeta), `unavailable`.

**5. `obtenerPaginaPartidos`** — Con `cursor = null` trae la primera página. Devuelve `cursor` = último documento leído y `hayMas = partidos.length === PARTIDOS_POR_PAGINA`. Si el usuario tiene exactamente 10, 20, 30… partidos, se hace una petición extra que regresa vacía y entonces `hayMas = false` (aceptado: es lo más simple).
Después de crear, editar o eliminar, F06 recarga **desde la primera página** (el cursor viejo ya no sirve si cambió el orden).
Errores: `'sin-conexion'`, `unavailable`, `permission-denied`.

**6. `editarPartido`** — Usa `updateDoc`, que **falla si el documento ya no existe**: así se detecta el caso "lo borré desde otro teléfono" (E2 de navegación).
Errores: `'sin-conexion'`, `not-found`, `permission-denied`, `unavailable`.

**7. `eliminarPartido`** — Si ya no existía, no da error: igual se quita de la lista.
Errores: `'sin-conexion'`, `permission-denied`, `unavailable`.

**Convertir documentos de Firestore a tipos de la app:** `documento.data()` no trae tipo. Se convierte con `as DatosPartido` (o el tipo del check-in) y se explica así: *"puedo confiar en la forma porque las reglas de Firestore no dejan guardar otra"*. Para el check-in, el `Timestamp` se pasa a `Date` con `.toDate()`.

### Conexión — `src/servicios/servicioConexion.ts`

- `hayConexion(): Promise<boolean>` con `NetInfo.fetch()` (clase *Offline*).
- Devuelve `false` solo si `isConnected === false` **o** `isInternetReachable === false`. Si `isInternetReachable` es `null` ("aún no sé", como dice la clase), se intenta.
- `verificarConexion(): Promise<void>` lanza `new Error('sin-conexion')` si `hayConexion()` es `false`.
- **Dependencia nueva:** `@react-native-community/netinfo` (la que usa la clase; funciona en Expo Go). Se instala con `npx expo install`.

### Errores — `src/utilidades/errores.ts`

`obtenerMensajeError(error: unknown): string` traduce cualquier error a un mensaje en español. El detalle técnico va a `console.error`; el usuario nunca ve textos como `"permission-denied"`.

| Error | Mensaje |
|---|---|
| `Error('sin-conexion')` | "No hay conexión. Revisa tu internet e intenta de nuevo." |
| `unavailable` | "No pudimos conectar con el servidor. Intenta de nuevo." |
| `deadline-exceeded` | "El servidor tardó demasiado. Intenta de nuevo." |
| `permission-denied` | "No tienes permiso para hacer esto." |
| `not-found` | "Este partido ya no existe." |
| `unauthenticated` | "Tu sesión terminó. Vuelve a iniciar sesión." |
| Cualquier otro | "Algo salió mal. Intenta de nuevo." |

Los códigos de Firestore se leen con `error instanceof FirebaseError` y `error.code`. Los errores de Auth (`auth/...`) los traduce F01.

---

## Reglas de seguridad de Firestore

Archivo `firestore.rules` en la raíz del repo (copia de lo publicado en la consola, para que el profesor lo revise).

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ---------- Funciones de apoyo ----------
    function haySesion() {
      return request.auth != null;
    }

    function esDueno(idUsuario) {
      return haySesion() && request.auth.uid == idUsuario;
    }

    // RN05: mismo catálogo que src/constantes/canchas.ts
    // 'prueba' solo existe en desarrollo; se quita antes de la entrega
    function canchasValidas() {
      return ['sullivan', 'parque-morelos', 'siglo-xxi', 'uabc-sauzal',
              'parque-hidalgo', 'gimnasio-municipal', 'parque-la-hoja', 'prueba'];
    }

    function esEnteroEntre(valor, minimo, maximo) {
      return valor is int && valor >= minimo && valor <= maximo;
    }

    // ---------- Check-ins (RN01, RN03, RN04, RN05) ----------
    function checkInValido() {
      let datos = request.resource.data;
      return datos.keys().hasOnly(['idCancha', 'creadoEn'])
        && datos.idCancha in canchasValidas()
        && datos.creadoEn == request.time; // hora del servidor (RN01)
    }

    match /checkins/{idUsuario} {
      allow read: if haySesion();                        // para contar (RN06: la app solo muestra números)
      allow create, update: if esDueno(idUsuario) && checkInValido();
      allow delete: if esDueno(idUsuario);               // "Ya me voy" (RN04)
    }

    // ---------- Partidos (RN09, RN10) ----------
    function partidoValido() {
      let datos = request.resource.data;
      let campos = ['fecha', 'idCancha', 'resultado', 'puntos', 'rebotes',
                    'asistencias', 'marcadorPropio', 'marcadorRival'];
      return datos.keys().hasOnly(campos)
        && datos.keys().hasAll(campos)
        && datos.fecha is string
        && datos.fecha.matches('^[0-9]{4}-[0-9]{2}-[0-9]{2}$')
        && (datos.idCancha == null || datos.idCancha in canchasValidas())
        && datos.resultado in ['gano', 'perdio']
        && esEnteroEntre(datos.puntos, 0, 100)
        && esEnteroEntre(datos.rebotes, 0, 100)
        && esEnteroEntre(datos.asistencias, 0, 100)
        && (datos.marcadorPropio == null || esEnteroEntre(datos.marcadorPropio, 0, 200))
        && (datos.marcadorRival == null || esEnteroEntre(datos.marcadorRival, 0, 200));
    }

    match /usuarios/{idUsuario}/partidos/{idPartido} {
      allow read, delete: if esDueno(idUsuario);                      // RN10
      allow create, update: if esDueno(idUsuario) && partidoValido(); // RN09, RN10
    }

    // Todo lo que no aparece aquí está prohibido (así empieza el modo producción).
  }
}
```

**Cómo explicarlo en la defensa:**

- **Autenticación vs. autorización** (clase *Autenticación*): `haySesion()` responde "¿quién eres?"; `esDueno()` responde "¿qué puedes hacer?".
- La app **ya** valida todo antes de enviar (mejor experiencia), pero alguien podría modificar la app y llamar a Firebase directo. Las reglas son la frontera real: **el frontend decide qué se muestra; el servidor decide qué se permite**.
- La llave de Firebase del `.env` termina dentro de la app, así que **no es un secreto**. Lo que protege los datos son estas reglas. Aun así se guarda en `.env` para no subirla al repo.

**Lo que las reglas NO validan (y por qué):**

| Regla | Por qué no | Quién la cuida |
|---|---|---|
| RN02 (150 m) | El servidor no conoce la ubicación del usuario (y no queremos guardarla, RN06). Requeriría Cloud Functions | La app (F03). Límite conocido del MVP |
| Fecha no futura y fecha real (`'2026-02-30'`) | Posible pero complica mucho las reglas | `validarFecha` en la app |
| Coherencia del marcador con el resultado | Igual | `validarMarcador` en la app |

---

## Persistencia local (AsyncStorage, RN11)

| Clave | Quién la escribe | Contenido | Cuándo se borra |
|---|---|---|---|
| `hoopsmap.historial` | `servicioCache.ts` (la usa F06) | `CacheHistorial` en JSON | Al cerrar sesión; si está corrupta; si es de otro usuario |
| Claves `firebase:...` | Firebase Auth, automático | Sesión del usuario | Las borra Firebase con `signOut` |

### Formato de la caché

```ts
// src/tipos/partido.ts
export type CacheHistorial = {
  idUsuario: string; // de quién son estos partidos
  guardadoEn: string; // ISO 8601, para el aviso "Datos guardados el…"
  partidos: Partido[]; // la última lista COMPLETA descargada
};
```

Ejemplo de lo que queda guardado:

```json
{
  "idUsuario": "aB3xYz...",
  "guardadoEn": "2026-11-02T18:40:12.000Z",
  "partidos": [
    { "idPartido": "k9Qw...", "fecha": "2026-11-02", "idCancha": "sullivan",
      "resultado": "gano", "puntos": 14, "rebotes": 6, "asistencias": 3,
      "marcadorPropio": 21, "marcadorRival": 17 }
  ]
}
```

### Funciones — `src/servicios/servicioCache.ts`

| Función | Qué hace |
|---|---|
| `guardarCacheHistorial(idUsuario, partidos)` | `JSON.stringify` + `setItem`. Se llama cada vez que `obtenerTodosLosPartidos` tiene éxito |
| `leerCacheHistorial(idUsuario): Promise<CacheHistorial \| null>` | Devuelve `null` si no hay nada. Si el JSON está roto, si no tiene la forma esperada o si `idUsuario` no coincide: la **borra**, registra con `console.error` y devuelve `null` |
| `borrarCacheHistorial()` | `removeItem`. La llama F01 al cerrar sesión |

**Reglas de la clase que se cumplen:**

- Siempre `await` (todo en AsyncStorage es asíncrono).
- Siempre `JSON.stringify` / `JSON.parse` (solo guarda texto), y `JSON.parse` dentro de `try/catch`.
- Siempre un valor por defecto al leer: aquí es `null` = "no hay caché".
- **Cerrar sesión de verdad:** se borra la caché y se limpian los stores, no solo la sesión.
- Guardar `idUsuario` dentro de la caché es un segundo seguro: si el borrado al cerrar sesión fallara, el siguiente usuario **no** vería partidos ajenos.

**`null` no es lo mismo que lista vacía:** `null` = "nunca se descargó nada" ("Sin conexión y sin datos guardados"); `partidos: []` = "se descargó y no tiene partidos" ("Aún no registras partidos").

**No se guarda en caché:** los check-ins. Un conteo de hace una hora sería mentir sobre quién está jugando (RN01).

---

## Sin conexión: estrategia por operación

Clasificación con las tres estrategias de la clase *Offline y Conectividad*:

| Operación | Estrategia | Qué ve el usuario |
|---|---|---|
| Ver canchas en el mapa | **Degradar** | Las canchas sí aparecen (catálogo local, RN05) |
| Ver jugadores por cancha | **Bloquear** | "Sin conexión: no podemos ver quién está jugando". **Nunca** se muestra "Vacía" (sería mentir) |
| Hacer / terminar check-in | **Bloquear** (RN11) | Botón deshabilitado + explicación |
| Ver historial | **Degradar** (RN11) | Caché con aviso "Sin conexión — datos guardados el 2 nov, 18:40". Solo lectura |
| Ver promedios | **Degradar** | Se calculan con la caché, con el mismo aviso |
| Crear / editar / eliminar partido | **Bloquear** (RN11) | Mensaje "No hay conexión…" |
| Encolar acciones | **No se usa** | Ver *Diferencias con lo visto en clase* |

---

## Validaciones

Todas son **funciones puras** (mismo resultado para los mismos datos, sin Firebase ni AsyncStorage), así que se prueban con Jest sin simular nada. Devuelven el **mensaje de error** o `null` si está bien. Antes de validar, los textos se limpian con `trim()`.

### Partido — `src/utilidades/validacionesPartido.ts`

| Función | Regla | Mensajes |
|---|---|---|
| `validarFecha(fecha, hoy)` | Obligatoria. Formato `AAAA-MM-DD`. Día real (no `'2026-02-30'`). No puede ser después de `hoy` (RN09) | "Elige la fecha del partido" · "Fecha no válida" · "La fecha no puede ser futura" |
| `validarCancha(idCancha)` | Opcional. Si no es `null`, debe existir en el catálogo (RN05) | "Elige una cancha de la lista" |
| `validarResultado(resultado)` | Obligatorio (RN09) | "Indica si ganaste o perdiste" |
| `validarEstadistica(texto, nombreCampo)` | Obligatoria. Solo dígitos (sin negativos ni decimales). Máximo `ESTADISTICA_MAXIMA` (100) | "Escribe tus {nombreCampo}" · "Usa solo números enteros" · "Máximo 100" |
| `validarMarcador(propio, rival, resultado, puntos)` | Opcional, pero **los dos o ninguno**. Enteros de 0 a `MARCADOR_MAXIMO` (200). Sin empate. Si `resultado` es `'gano'`, propio > rival; si `'perdio'`, propio < rival. Tus puntos no pueden ser más que los de tu equipo | "Escribe los dos marcadores o deja ambos vacíos" · "Usa solo números enteros" · "Máximo 200" · "En básquet no hay empates" · "Si ganaste, tu marcador debe ser mayor" · "Si perdiste, tu marcador debe ser menor" · "Tus puntos no pueden ser más que los de tu equipo" |
| `validarPartido(valores, hoy)` | Llama a todas las anteriores y junta los mensajes en un `ErroresPartido` | — |
| `hayErrores(errores)` | `true` si `ErroresPartido` tiene al menos un mensaje | — |
| `convertirAPartido(valores)` | Convierte un formulario **ya válido** en `DatosPartido`: textos a número con `Number(...)`; marcador vacío → `null` | — |
| `convertirAValores(partido)` | Al revés, para llenar el formulario en modo editar (F05) | — |

**Por qué `hoy` es parámetro y no se calcula dentro:** para que la función sea pura. En los tests se pasa una fecha fija (`'2026-11-02'`) y el resultado no cambia según el día en que se corra la prueba.

### Fechas — `src/utilidades/fechas.ts`

| Función | Qué hace | Ejemplo |
|---|---|---|
| `obtenerFechaHoy(ahora: Date): string` | Día local en `AAAA-MM-DD` (sin `toISOString`) | 2 nov 2026, 23:30 en Ensenada → `'2026-11-02'` |
| `esFechaReal(fecha: string): boolean` | Que el día exista en el calendario | `'2026-02-30'` → `false` |

### Check-in y afluencia — `src/utilidades/checkIns.ts` y `src/utilidades/afluencia.ts`

| Función | Ejemplo |
|---|---|
| `calcularExpiracion(creadoEn: Date): Date` | 18:00 → 19:30 |
| `calcularLimiteActivos(ahora: Date): Date` | 19:30 → 18:00 |
| `minutosRestantes(checkIn, ahora): number` | Expira 19:30, ahora 19:00 → 30. Nunca negativo (vencido → 0) |
| `estaActivo(checkIn, ahora): boolean` | `expiraEn > ahora` |
| `contarJugadoresPorCancha(idsCancha: string[])` | Lista vacía → `{}` |
| `obtenerNivelAfluencia(jugadores: number)` | 0, 1, 5, 6, 9, 10 → vacia, poca, poca, reta, reta, llena |

### Promedios — `src/utilidades/promedios.ts`

`calcularPromedios(partidos: Partido[]): Promedios`

- Suma y divide entre `partidosJugados`, redondeando a 1 decimal (`Math.round(valor * 10) / 10`).
- **Con 0 partidos devuelve todo en 0**, no `NaN` (no se divide entre cero).
- Ejemplo: puntos 10, 15 y 20 → promedio 15; 2 de 3 con `'gano'` → `victorias: 2`.

### Usuario — `src/utilidades/validacionesUsuario.ts`

| Función | Regla | Mensajes |
|---|---|---|
| `validarNombre(nombre)` | Obligatorio, de 2 a 30 caracteres después de `trim()` | "Escribe tu nombre" · "Mínimo 2 caracteres" · "Máximo 30 caracteres" |

### Constantes — `src/constantes/configuracion.ts`

```ts
export const CHECK_IN_DURACION_MINUTOS = 90; // RN01
export const CHECK_IN_DISTANCIA_MAXIMA_METROS = 150; // RN02 (la usa F03)
export const PARTIDOS_POR_PAGINA = 10; // F06
export const ESTADISTICA_MAXIMA = 100; // RN09: puntos, rebotes y asistencias
export const MARCADOR_MAXIMO = 200; // RN09: marcador final
export const NOMBRE_LONGITUD_MINIMA = 2; // F01
export const NOMBRE_LONGITUD_MAXIMA = 30; // F01
export const CLAVE_CACHE_HISTORIAL = 'hoopsmap.historial'; // RN11
```

Los límites 100 y 200 se repiten en `firestore.rules` (las reglas no pueden importar TypeScript). Si cambian, se cambian en los dos lugares.

### Variables de entorno — `.env.example`

```text
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_CANCHA_PRUEBA_LAT=
EXPO_PUBLIC_CANCHA_PRUEBA_LNG=
```

---

## Casos de error y casos límite

| ID | Situación | Comportamiento esperado |
|---|---|---|
| E1 | Sin internet al hacer o terminar check-in, o al crear, editar o eliminar un partido | `verificarConexion` lanza `'sin-conexion'` **antes** de llamar a Firebase. Mensaje inmediato, sin spinner eterno. No se guarda nada |
| E2 | Sin internet al pedir los check-ins activos | Error `'sin-conexion'`. El mapa muestra las canchas sin número y el aviso de *Sin conexión*. Nunca "Vacía" |
| E3 | Sin internet al abrir Historial o Perfil | Se lee la caché y se muestra con aviso y fecha (`guardadoEn`). Si es `null`: "Sin conexión y sin datos guardados" |
| E4 | Caché corrupta (JSON roto o forma incorrecta) | `leerCacheHistorial` la borra, registra con `console.error` y devuelve `null`. La app no se cierra |
| E5 | Caché de otro usuario (falló el borrado al cerrar sesión) | Se ignora, se borra y se devuelve `null`. Nunca se muestran partidos ajenos |
| E6 | Check-in vencido (pasaron 90 min, RN01) | No llega en la consulta: no se cuenta y `miCheckIn` es `null`. El usuario puede hacer un check-in nuevo, que reemplaza al documento viejo |
| E7 | "Ya me voy" con el check-in ya vencido (pantalla abierta mucho tiempo) | `deleteDoc` no falla. Se recarga el resumen |
| E8 | Check-in en otra cancha con uno activo (RN03) | `setDoc` reemplaza el documento. La cancha anterior baja un jugador en la siguiente consulta |
| E9 | Doble toque en "Hacer check-in" | Se escribe el mismo documento dos veces: el resultado es el mismo (un solo check-in) |
| E10 | Doble toque en "Guardar" partido | `addDoc` crearía **dos** partidos. F05 deshabilita el botón mientras guarda |
| E11 | Intentar leer o modificar un partido de otro usuario (RN10) | La app nunca arma esa ruta (siempre usa el uid de la sesión). Si alguien la manipula, Firestore responde `permission-denied` → "No tienes permiso para hacer esto" |
| E12 | Editar un partido borrado desde otro teléfono | `updateDoc` lanza `not-found` → "Este partido ya no existe" (E2 de navegación) |
| E13 | Eliminar un partido que ya no existe | `deleteDoc` no falla. Se quita de la lista |
| E14 | Firebase falla o tarda (`unavailable`, `deadline-exceeded`) | Mensaje de la tabla de *Errores* y botón "Reintentar" en la pantalla (estado de error) |
| E15 | El registro crea la cuenta pero no alcanza a guardar el nombre | `nombre` llega como `''`. La app muestra "Jugador". **Nota para F01:** Firebase avisa del nuevo usuario antes de que termine `updateProfile`, así que F01 debe actualizar el nombre en el store después de guardarlo |
| E16 | Partido con un `idCancha` que ya no existe (por ejemplo, la cancha de prueba) | Se muestra "Cancha no disponible". Al editarlo, `validarCancha` pide elegir otra o ninguna |
| E17 | Usuario sin partidos | Página vacía, `hayMas = false`, promedios en 0 (no `NaN`), caché con `partidos: []` |
| E18 | Exactamente 10, 20… partidos | Una petición extra regresa vacía y `hayMas` pasa a `false` |
| E19 | Reloj del teléfono desfasado | `creadoEn` no se afecta (hora del servidor). El conteo se mueve esos minutos (límite conocido) |
| E20 | Permiso de ubicación negado | El modelo no cambia: la ubicación nunca se guarda. Sin ubicación, F03 no llama a `crearCheckIn` |
| E21 | Permiso de cámara negado | El modelo no cambia: la foto nunca se guarda. F07 ofrece galería o tarjeta sin foto |
| E22 | Alguien modifica la app para saltarse RN02 | Las reglas no pueden impedirlo (ver *Lo que las reglas NO validan*). Límite conocido del MVP |

---

## Resultado esperado

- Los tipos de las cuatro entidades existen en `src/tipos/`, en español y sin `any`.
- Firestore tiene solo dos rutas con datos: `checkins/{idUsuario}` y `usuarios/{idUsuario}/partidos/{idPartido}`, protegidas por reglas que cumplen RN03, RN05, RN09 y RN10.
- Las 7 operaciones de la rúbrica (más `obtenerTodosLosPartidos`) existen como funciones de servicio con mensajes de error en español.
- El historial se ve sin internet desde AsyncStorage y la caché se borra al cerrar sesión.
- Las validaciones, fechas, conteos y promedios son funciones puras con pruebas de Jest.

---

## Criterios de aceptación

Probados en el iPhone con Expo Go, en la consola de Firebase y con Jest.

**Firestore y reglas** (Rules Playground de la consola de Firebase)

- [ ] CAD01 — Como usuario A, leer `usuarios/B/partidos/x` → **denegado**. Leer `usuarios/A/partidos/x` → permitido.
- [ ] CAD02 — Como usuario A, escribir en `checkins/B` → **denegado**. Escribir en `checkins/A` con `idCancha: 'sullivan'` y `creadoEn` = hora de la petición → permitido.
- [ ] CAD03 — Escribir `checkins/A` con `idCancha: 'mi-casa'` → **denegado**.
- [ ] CAD04 — Crear un partido con `puntos: 150`, o con un campo extra (`mvp: true`), o sin `rebotes` → **denegado**.
- [ ] CAD05 — Sin sesión, cualquier lectura o escritura → **denegada**.

**Check-ins**

- [ ] CAD06 — Después de hacer check-in, en la consola existe `checkins/{mi uid}` con **solo** `idCancha` y `creadoEn`.
- [ ] CAD07 — Al hacer check-in en otra cancha, en la consola sigue habiendo **un solo** documento con mi uid, con la nueva cancha (RN03).
- [ ] CAD08 — Después de "Ya me voy", el documento ya no existe (RN04).
- [ ] CAD09 — Con dos cuentas con check-in en Sullivan, `obtenerCheckInsActivos` devuelve `jugadoresPorCancha.sullivan === 2` y el resultado no contiene ningún uid ajeno (RN06).

**Partidos**

- [ ] CAD10 — Un partido creado aparece en `usuarios/{mi uid}/partidos/{id}` con exactamente los 8 campos de la tabla.
- [ ] CAD11 — Con 23 partidos, el historial llega en páginas de 10, 10 y 3; después de la tercera, `hayMas` es `false`.
- [ ] CAD12 — Editar un partido borrado desde la consola muestra "Este partido ya no existe".

**Sin conexión y caché**

- [ ] CAD13 — En modo avión, intentar guardar un partido o hacer check-in muestra "No hay conexión…" en menos de 2 segundos (sin spinner eterno).
- [ ] CAD14 — Después de abrir el Historial con internet, en modo avión el Historial y los promedios se ven desde la caché con el aviso y la fecha de guardado.
- [ ] CAD15 — Después de cerrar sesión, `leerCacheHistorial` devuelve `null` (prueba de Jest con AsyncStorage simulado).

**Pruebas unitarias (Jest)** — cubren los 12 unitarios de la rúbrica

- [ ] CAD16 — `obtenerFechaHoy` y `esFechaReal` (incluye las 23:30 en Ensenada y `'2026-02-30'`).
- [ ] CAD17 — `validarFecha`: vacía, formato malo y fecha futura.
- [ ] CAD18 — `validarEstadistica`: vacío, `'-3'`, `'4.5'`, `'101'` y `'12'`.
- [ ] CAD19 — `validarMarcador`: ambos vacíos (válido) y solo uno lleno.
- [ ] CAD20 — `validarMarcador`: empate, ganó con marcador menor, y puntos mayores que el marcador propio.
- [ ] CAD21 — `convertirAPartido`: marcador vacío → `null`, textos → números.
- [ ] CAD22 — `calcularExpiracion` y `minutosRestantes` (incluye vencido → 0).
- [ ] CAD23 — `contarJugadoresPorCancha` (incluye lista vacía).
- [ ] CAD24 — `obtenerNivelAfluencia` en 0, 1, 5, 6, 9 y 10 (RN07).
- [ ] CAD25 — `calcularPromedios` con 3 partidos y con 0 partidos (sin `NaN`).
- [ ] CAD26 — `obtenerMensajeError` con `'sin-conexion'`, `permission-denied` y un error desconocido.
- [ ] CAD27 — `leerCacheHistorial` con JSON roto y con caché de otro usuario → `null` y la clave se borra.

**Código**

- [ ] CAD28 — `npx tsc --noEmit` pasa; no hay `any` en `src/tipos/`, `src/servicios/` ni `src/utilidades/`.
- [ ] CAD29 — Solo `src/servicios/` importa `firebase/*`, AsyncStorage y NetInfo (excepto `FirebaseError` en `errores.ts`).
- [ ] CAD30 — Buscar en el repo las coordenadas de la cancha de prueba no da resultados; `.env.example` existe sin valores.

---

## Tasks

Cada task ≈ un commit. Las marcadas **(con Fxx)** se hacen cuando se implementa esa feature, para que el código llegue junto con quien lo usa.

**Base (semana 1)**

- [ ] **D1 — Crear proyecto de Firebase** (Auth correo/contraseña, Firestore en modo producción) y agregar `.env.example`. Revisar que `.env` esté en `.gitignore`.
- [ ] **D2 — Instalar Firebase y AsyncStorage** (`npx expo install firebase @react-native-async-storage/async-storage`) y crear `src/servicios/firebase.ts` (`initializeApp`, `initializeAuth` con persistencia en AsyncStorage, `getFirestore`).
- [ ] **D3 — Crear los tipos** en `src/tipos/` (`cancha.ts`, `usuario.ts`, `checkIn.ts`, `partido.ts`).
- [ ] **D4 — Crear `src/constantes/canchas.ts`** (RN05 + cancha de prueba desde `.env`), `src/constantes/configuracion.ts` y `buscarCancha`.
- [ ] **D5 — Escribir `firestore.rules`**, publicarlas en la consola y probar CAD01–CAD05 en el Rules Playground.
- [ ] **D6 — Configurar Jest** (`jest-expo` + React Native Testing Library) y el simulador de AsyncStorage para pruebas.
- [ ] **D7 — Utilidades de fechas y errores** + pruebas (CAD16, CAD26).
- [ ] **D8 — `servicioConexion`** (instalar NetInfo con `npx expo install @react-native-community/netinfo`).
- [ ] **D9 — `validarNombre`** + prueba **(con F01)**.

**Check-ins**

- [ ] **D10 — Utilidades de check-in y afluencia** + pruebas (CAD22–CAD24) **(con F02/F03)**.
- [ ] **D11 — `servicioCheckIns`**: `crearCheckIn`, `terminarCheckIn`, `obtenerCheckInsActivos` **(con F03)**. Probar CAD06–CAD09.

**Partidos**

- [ ] **D12 — Validaciones y conversiones de partido** + pruebas (CAD17–CAD21) **(con F05)**.
- [ ] **D13 — `servicioPartidos`**: `crearPartido`, `editarPartido`, `eliminarPartido` **(con F05)**. Probar CAD10 y CAD12.
- [ ] **D14 — `servicioPartidos`**: `obtenerPaginaPartidos` y `obtenerTodosLosPartidos` **(con F06)**. Probar CAD11.
- [ ] **D15 — `calcularPromedios`** + pruebas (CAD25) **(con F06)**.
- [ ] **D16 — `servicioCache`** + pruebas (CAD15, CAD27) **(con F06)**. Probar CAD13–CAD14 en modo avión.

**Cierre**

- [ ] **D17 — Revisar CAD28–CAD30** y actualizar `00-project.md` y `01-navigation.md` con lo que cambió (ver *Cambios propuestos a otras specs*).
- [ ] **D18 — Antes de la entrega:** quitar `'prueba'` de `firestore.rules` y del `.env`, y borrar los partidos de prueba que usen esa cancha (si no, ya no se podrían editar).

---

## Diferencias con lo visto en clase (para la defensa)

| En clase | En HoopsMap | Por qué |
|---|---|---|
| El token de sesión va en **SecureStore** (clase *Persistencia*) | Firebase guarda su sesión en **AsyncStorage** (`getReactNativePersistence`), como dice 00-project | Es la persistencia que Firebase ofrece para React Native: guarda y renueva la sesión solo, sin código propio. Usar SecureStore exigiría un adaptador (SecureStore no acepta los `:` de las claves de Firebase y está pensado para valores de ~2 KB). La app no maneja datos financieros ni sensibles, y una sesión robada se puede revocar desde la consola de Firebase. La contraseña nunca se guarda en el teléfono |
| Cola de acciones para **encolar** sin red | No se encola nada | Un check-in encolado mentiría (la hora y el lugar ya no serían reales). Encolar partidos está en *Funcionalidades futuras* de 00-project. La práctica de la clase pide justificarlo por escrito: esta tabla es esa justificación |
| `NetInfo` en las pantallas con `useNetInfo` | `NetInfo.fetch()` dentro de un servicio | Los servicios son el único lugar que habla con módulos nativos. Las pantallas pueden usar además `useNetInfo` para el aviso de *Sin conexión* (F02/F06) |
| Caché con un hook `usePersistedState` | Caché en `servicioCache` llamada desde el store | Los datos vienen de Firebase y los usan dos pantallas (Historial y Perfil) |
| "Cerrar sesión de verdad" | Se cumple: se borra la caché y se limpian los stores (F01) | Mismo principio de la clase |

---

## Decisiones resueltas

- **Usuario:** uid, correo y nombre, todo en Firebase Auth (`displayName`). Sin colección de usuarios en Firestore.
- **RN03:** el id del documento de check-in es el uid; `setDoc` reemplaza y `deleteDoc` termina.
- **Partidos:** subcolección `usuarios/{idUsuario}/partidos`, id automático.
- **Hora del check-in:** del servidor (`serverTimestamp`); la expiración se calcula.
- **Fecha del partido:** texto `'AAAA-MM-DD'`, solo el día, hoy o antes.
- **Marcador:** dos números opcionales (los dos o ninguno), coherentes con el resultado.
- **Promedios:** se descargan todos los partidos y se calculan con una función pura.
- **Caché:** la lista completa de `obtenerTodosLosPartidos`, en la clave `hoopsmap.historial`.
- **Paginación:** cursor = último documento leído, páginas de 10.
- **Límites:** puntos, rebotes y asistencias de 0 a 100; marcador de 0 a 200.
- **Puntos ≤ marcador propio:** no puedes anotar más que tu equipo.
- **Cerrar sesión con check-in activo:** F01 llama a `terminarCheckIn` antes de cerrar sesión; si falla (sin internet), el check-in vence solo a los 90 min (RN01).
- **Sesión de Firebase:** en AsyncStorage, como dice 00-project. La justificación para la defensa está en *Diferencias con lo visto en clase*.

## Cambios propuestos a otras specs

- **00-project.md:** RN04 (terminar check-in al cerrar sesión), RN09 (límites y coherencia del marcador), rúbrica (nombre en el registro y lectura extra para promedios) y *Decisiones técnicas* (NetInfo y por qué la sesión va en AsyncStorage).
- **01-navigation.md:** Perfil muestra **nombre**, correo, promedios y "Cerrar sesión"; cerrar sesión también termina el check-in activo.