# CLAUDE.md — HoopsMap

Instrucciones para Claude Code en este repo. Aplican en cada sesión.

## Qué es HoopsMap

App móvil (React Native + Expo + TypeScript) para jugadores recreativos de básquetbol. Un mapa muestra cuánta gente hay en cada cancha gracias a check-ins temporales. Una bitácora guarda sus partidos, sus promedios y una tarjeta de jugador para compartir. Proyecto individual de la materia Aplicaciones Móviles; entrega a finales de noviembre de 2026.

## Mapa de documentos

| Qué                                                                        | Dónde                                                                 |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Visión, MVP, reglas RNxx, rúbrica, decisiones técnicas, plan               | `specs/00-project.md` (fuente de verdad)                              |
| Navegación: 8 pantallas, parámetros, paleta y tipografía                   | `specs/01-navigation.md`                                              |
| Datos: tipos, Firestore, servicios, caché, validaciones, mensajes de error | `specs/02-data-model.md`                                              |
| Features F01–F07                                                           | `specs/features/`                                                     |
| Estándar de código                                                         | `docs/coding-standards.md`                                            |
| Reglas de seguridad de Firestore                                           | `firestore.rules` (copia de las publicadas; las define 02-data-model) |
| Variables de entorno, sin valores                                          | `.env.example`                                                        |
| Clases del profesor                                                        | https://academy.alvesc.com/ruta/desarrollo-movil                      |

- Orden de autoridad: `00-project.md` > otras specs > `coding-standards.md`.
- Si dos documentos no coinciden, manda el de más arriba. Avísame para corregir el otro.

## Flujo SDD

1. No implementes nada sin spec. Si la feature no tiene spec en `specs/features/`, detente y avísame.
2. Antes de escribir código, lee la spec completa, las RNxx que cita de `00-project.md` y lo que use de `01-navigation.md` y `02-data-model.md`.
3. Implementa una sola task de la sección _Tasks_.
4. Al terminar, márcala `[x]` en la spec y detente. No empieces la siguiente.
   - Tú marcas solo la task. Los criterios de aceptación (CAxx, CADxx) los marco yo después de probarlos (§19).
5. No agregues nada que la spec no pida, aunque parezca útil. Propónlo como texto; yo decido.
6. Si la spec es ambigua o contradice el código, pregunta antes de seguir. No inventes requisitos.
7. Si algo debe cambiar, propón el cambio a la spec con el texto exacto y espera mi respuesta.

## Estándar de código (resumen)

Sigue `docs/coding-standards.md`. Lo crítico:

- **Nombres (§1, §3):** todo lo que nombramos va en español sin acentos ni ñ (`anio`, `esDueno`, `PantallaMapa.tsx`). Las APIs de librerías se quedan en inglés. Los textos para el usuario van en español con acentos. Comentarios y tests, en español. Excepción: los archivos de `specs/`, la carpeta `docs/` y `coding-standards.md` conservan sus nombres.
- **Carpetas (§2):** `src/navegacion`, `pantallas`, `componentes`, `hooks`, `stores`, `servicios`, `utilidades`, `constantes`, `tipos`.
- **Capas (§4):** pantalla → store (Zustand) → servicio → Firebase / AsyncStorage / NetInfo. Solo `src/servicios/` importa Firebase, AsyncStorage y NetInfo (excepciones en §4). Solo `cerrarSesion` de `useStoreSesion` llama a `limpiar()` de otros stores; los demás stores nunca importan `useStoreSesion`.
- **TypeScript (§5):** modo strict. Usa `type`, nunca `interface` ni `enum`. Prohibidos `any`, `as any`, `@ts-ignore` y el `!`.
- **Tema (§7):** todo color, tamaño de letra, espaciado, radio y tamaño de icono sale de `src/constantes/tema.ts`.
- **4 estados (§9):** en este orden: cargando → error → vacío → datos, con `VistaCargando`, `VistaError` y `VistaVacia`. Los casos sin internet también están en §9.
- **Errores (§10):**
  - El servicio lanza el error.
  - El store lo atrapa con `try/catch`, hace `console.error` y lo traduce con `obtenerMensajeError`.
  - El usuario solo ve los mensajes en español de `02-data-model.md`. Nunca un `catch` vacío.
- **Permisos negados (§10):** explica para qué sirve el permiso y cómo activarlo en Ajustes. Deshabilita lo que dependa de él. La app nunca se cierra ni se queda en blanco.
- **Formularios (§11):** `useFormulario` + validaciones como funciones puras.
- **Tests (§12):** junto al archivo que prueban. `it` en español. Cada test cita su criterio (`// CAD24`).
- **Como en clase (§0):** si te apartas de lo que enseñó el profesor, deja un comentario que diga por qué.

## Modo aprendizaje

Estoy aprendiendo React Native y defiendo el código línea por línea ante el profesor.

- Escribe la solución más simple que cumpla la spec. Nada de patrones avanzados (§18).
- Al terminar cada task, explícame en lenguaje sencillo:
  - qué archivos creaste o cambiaste y por qué;
  - qué concepto nuevo de React Native apareció, si hubo uno.
- Si existe una forma más "pro", menciónala en una línea, pero implementa la simple.

## Entorno y pruebas en el iPhone

- Laptop con Windows + iPhone con Expo Go. No hay simulador de iOS y no se publica en tiendas. Todo debe correr en Expo Go.
- Antes de usar una API de Expo, revisa la documentación de la versión del SDK que dice `package.json` (https://docs.expo.dev/versions/), no tu memoria.
- Tú no puedes ver el teléfono. Al terminar cada task, dame pasos exactos para probarla:
  1. Cómo abrirla (`npx expo start` y Expo Go).
  2. Qué tocar y qué debo ver, citando el criterio de aceptación (CAxx).
  3. Los casos negativos que apliquen: sin internet (modo avión), permiso de ubicación o cámara negado, lista vacía y falla de Firebase.
- Si un criterio se prueba en Jest o en la consola de Firebase (Rules Playground), dímelo.
- Si cambia `.env`, recuérdame reiniciar `npx expo start` (§15).

## Antes de dar una task por terminada

Corre estos comandos y muéstrame el resultado:

```bash
npx tsc --noEmit
npx expo lint
npx jest
```

- La primera vez, `npx expo lint` instala ESLint y crea `eslint.config.js` (§16). Pídeme permiso antes de correrlo.
- `npx jest` funciona solo cuando Jest ya está configurado (task D6 de `02-data-model.md`). Antes de eso, dime que no se corrió.
- Nunca "arregles" un error apagando la revisión (`any`, `@ts-ignore`, `eslint-disable`).
- Repasa los criterios de aceptación de la spec y la _Definición de terminado_ (§19). Dime cuáles crees que ya se cumplen y cuáles debo probar en el iPhone, en Jest o en la consola de Firebase.
- Al cerrar una feature no puede quedar `console.log`, código comentado ni código provisional.

## Dependencias (§14)

- Solo las de _Decisiones técnicas_ de `00-project.md`. La lista está en §14.
- Prefiere los módulos de Expo y lo que ya trae la plantilla.
- Pregúntame antes de instalar y explica para qué sirve el paquete.
- Siempre con `npx expo install <paquete>`. Para las de desarrollo: `npx expo install <paquete> -- --save-dev`. Nunca `npm install`.
- Si hace falta una nueva, primero se propone en la spec con su porqué.

## Git (§17)

- Nunca hagas commits ni push. Yo reviso el diff y commiteo.
- Se trabaja solo en `main`. No crees ramas.
- Al terminar cada task, propón el mensaje de commit:
  - en español, empieza con un verbo (`agrega`, `corrige`, `quita`…);
  - una sola idea (si necesita "y", son dos commits);
  - termina con el id de la task entre paréntesis.
  - Ejemplos: `agrega dependencias de navegación (N1)`, `crea las 8 pantallas provisionales (N4)`. Las tasks de features usan `F03.1`, `F03.2`…
  - Si el cambio no es una task, termina con el nombre de la spec o del archivo (sin `.md`): `(01-navigation)`, `(CLAUDE)`, `(.gitignore)`.

## Datos privados (§15)

- Nunca escribas, muestres ni copies valores de `.env` (coordenadas, llaves de Firebase) en código, specs, mensajes ni commits.
- Para saber qué variables existen, usa `.env.example`. `.env` nunca se sube.
- Las variables se leen solo en `src/servicios/firebase.ts` y `src/constantes/canchas.ts`, escritas completas (`process.env.EXPO_PUBLIC_...`).
- El repo es público: nada de coordenadas, contraseñas ni correos reales.

## Prohibido para Claude Code (§18)

- Implementar algo sin spec, más de una task a la vez, o funcionalidades que la spec no pide (se proponen como texto).
- Inventar requisitos: si la spec es ambigua o contradice el código, pregunta.
- Instalar paquetes sin preguntar, o con `npm install` en lugar de `npx expo install`.
- Hacer commits o push.
- Cambiar una spec sin proponer el cambio primero.
- "Arreglar" un error de TypeScript o ESLint apagando la revisión (`any`, `@ts-ignore`, `eslint-disable`).

Lo prohibido en el código también está en §18: respétalo completo.
