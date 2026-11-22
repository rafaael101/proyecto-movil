# F04 — Detalle de cancha y su afluencia

> **Estado:** v1.0 (versión mínima de 00-project: nombre, nivel de afluencia y botón de check-in) · **Última actualización:** 2026-11-21
> **Depende de:** `specs/00-project.md` (RN05, RN06, RN07, *MVP → Si falta tiempo*), `specs/01-navigation.md` (DetalleCancha, *Títulos*, E1, E9, CA13, CA19), `specs/02-data-model.md` (`NivelAfluencia`, `ResumenAfluencia`, *Conteo de jugadores*, *Sin conexión*, E2, E14, D4, D10, CAD24), `specs/features/F02-courts-map.md` (`useStoreCheckIns`, `coloresAfluencia`, `tamanoMarcador`, regla del "?"), `specs/features/F03-check-in.md` (`PanelCheckIn`, F03.8) y `docs/coding-standards.md` (§4 excepción 3, §6, §7, §9)

---

## Objetivo

Que el jugador vea en el detalle de una cancha **su nombre** (en el header) y **cuántos jugadores hay y su nivel** (RN07), arriba del botón de check-in de F03.

| Requisito de la rúbrica | Cómo |
|---|---|
| Navegación (Stack) | Título dinámico con `useLayoutEffect` (01-navigation, *Títulos*) |
| State management | Lee `resumen` de `useStoreCheckIns` (F02). Sin acciones nuevas |
| Backend | Ninguna operación nueva: usa el conteo que ya cargó F02 |
| Testing | Sin tests nuevos. CAD22–CAD24 van en D10 (bloque de F02) |

---

## Actor

- **Jugador con sesión:** consulta la afluencia de una cancha. Solo ve números (RN06).

---

## Precondiciones

- F02 y F03 terminadas: `useStoreCheckIns` con `resumen`, `PanelCheckIn` y la pantalla de F03.8 (`VistaCargando` y E1).
- Existen `buscarCancha` (D4), `obtenerNivelAfluencia` (D10), `coloresAfluencia` y `tamanoMarcador` (F02.2).
- El título inicial "Cancha" ya está en `NavegadorRaiz` (N7).

---

## Datos de entrada

| Dato | De dónde |
|---|---|
| Cancha | `buscarCancha(route.params.idCancha)` (RN05) |
| Conteo | `resumen` de `useStoreCheckIns` (F02); no se vuelve a pedir |
| ¿Hay internet? (solo para el "?") | `useNetInfo` en la pantalla (§4, excepción 3) |

---

## Diseño

### Constante nueva — `src/constantes/configuracion.ts`

```ts
// Nombres de los niveles de RN07. Las llaves son NivelAfluencia.
export const NOMBRES_AFLUENCIA: Record<NivelAfluencia, string> = {
  vacia: 'Vacía',
  poca: 'Poca gente',
  reta: 'Hay reta',
  llena: 'Llena',
};
```

### Componente nuevo — `src/componentes/TarjetaAfluencia.tsx`

Solo props (§4). Misma tarjeta que `PanelCheckIn`: fondo `superficie`, borde `borde`, `radio`, padding `md`. En una fila: burbuja + texto.

```ts
type PropsTarjetaAfluencia = {
  jugadores: number | null; // null = sin datos confiables → "?"
};
```

| Si… | Burbuja (`tamanoMarcador`, como `MarcadorCancha`) | Texto (`cuerpo`) |
|---|---|---|
| `jugadores === null` | Fondo `superficie`, borde `borde`, "?" en `textoSecundario` | "No podemos ver quién está jugando. Actualiza desde el mapa." en `textoSecundario` |
| Si no | Fondo `coloresAfluencia[nivel]`, número en `textoSobrePrimario`, `pequeno`, peso `'700'` | "{jugadores} jugador(es) · {NOMBRES_AFLUENCIA[nivel]}" en `texto` |

- `nivel = obtenerNivelAfluencia(jugadores)` (RN07).
- Singular solo con 1: "1 jugador · Poca gente"; si no, "0 jugadores · Vacía", "7 jugadores · Hay reta".

### `PantallaDetalleCancha` (parte de F04)

- **Título:** `useLayoutEffect` → `navigation.setOptions({ title: cancha?.nombre ?? 'Cancha' })`, con `[navigation, cancha]`. Va **antes** de los `return` tempranos (regla de los hooks). En E1 queda "Cancha".
- **Jugadores** (la misma regla de F02):

```ts
const sinConexion = isConnected === false || isInternetReachable === false;
const jugadores =
  sinConexion || resumen === null ? null : (resumen.jugadoresPorCancha[cancha.idCancha] ?? 0);
```

- **Orden** (el de F03.8): `usuario === null` → `VistaCargando`; cancha no encontrada → E1; si no, `ScrollView` con `TarjetaAfluencia` y, debajo (margen `md`), `PanelCheckIn`.
- El detalle **no** recarga el conteo: usa el que cargó el Mapa. Cuando F03 hace o termina un check-in, llama a `cargarResumen` y la tarjeta cambia sola (mismo store).

---

## Flujo principal

1. Mapa → toco una burbuja → DetalleCancha (F02).
2. El header muestra el nombre de la cancha (RN05).
3. La tarjeta muestra la burbuja con el número y "N jugadores · Nivel" (RN07).
4. Debajo está el `PanelCheckIn` (F03). Si hago check-in o "Ya me voy", la tarjeta sube o baja 1 sin tocar nada.

---

## Validaciones

F04 no tiene formularios.

- **RN05:** si `buscarCancha` da `undefined` → E1 de 01-navigation (ya en F03.8).
- **RN06:** la tarjeta solo recibe un número; nunca uids.
- **"?" y no "0":** sin datos confiables nunca se muestra "0 jugadores · Vacía" (02-data-model, *Sin conexión*).

---

## Casos de error

| ID | Situación | Comportamiento esperado |
|---|---|---|
| E1 | **Sin internet** | Burbuja "?" + "No podemos ver quién está jugando. Actualiza desde el mapa." Si se va el internet con el detalle abierto, cambia sola (`useNetInfo`). El panel sigue igual que F03-E1 |
| E2 | **Firebase falla** al cargar el conteo (F02-E4) | `resumen` es `null` → "?" y el mismo texto. Se reintenta con "Reintentar" o "Actualizar" del Mapa |
| E3 | **Nadie en la cancha** | Burbuja "0" en gris + "0 jugadores · Vacía". El panel deja hacer check-in (F03-E7) |
| E4 | **Permiso de ubicación negado** | La tarjeta se ve igual (no usa GPS). La explicación es del panel (F03-E2) |
| E5 | `idCancha` fuera del catálogo | E1 de 01-navigation: header "Cancha", "No encontramos esta cancha" + "Volver al mapa" |

---

## Resultado esperado

El detalle muestra el nombre de la cancha en el header, cuántos jugadores hay con el color y nombre de su nivel, y el botón de check-in. Sin internet o con una falla se ve "?" con una explicación, nunca un "0" falso ni una pantalla en blanco.

---

## Criterios de aceptación

Probados en el iPhone con Expo Go y en la consola de Firebase. Los documentos `prueba-N` se crean y borran como en F02.

- [ ] F04-CA01 — Toco Sullivan en el Mapa: el header dice su nombre (iOS puede cortarlo con "…"), no se ve la barra de tabs y la flecha regresa al Mapa (CA13 de 01-navigation).
- [ ] F04-CA02 — Sin check-ins en Sullivan: burbuja "0" gris y "0 jugadores · Vacía".
- [ ] F04-CA03 — Con 1 documento en `sullivan` y "Actualizar" en el Mapa: "1 jugador · Poca gente" en verde. Con 6: "6 jugadores · Hay reta" en naranja ("Llena" lo cubre CAD24 en Jest). Siempre el mismo número que la burbuja del Mapa y ningún uid (RN06, RN07).
- [ ] F04-CA04 — En la cancha de prueba hago check-in: la tarjeta sube 1 sin salir del detalle; con "Ya me voy" baja 1.
- [ ] F04-CA05 — En modo avión abro un detalle: "?" y "No podemos ver quién está jugando. Actualiza desde el mapa."; nunca "0". Con el detalle abierto y números en pantalla, activo el modo avión: cambia a "?" sin tocar nada.
- [ ] F04-CA06 — Con la regla de lectura de `checkins` en `if false;` y "Actualizar" en el Mapa, el detalle muestra "?". **Regreso la regla original** (D5).
- [ ] F04-CA07 — Con el permiso de ubicación negado, la tarjeta se ve igual.
- [ ] F04-CA08 — Con el detalle de la cancha de prueba abierto, cambio **temporalmente** su `idCancha` en `canchas.ts` (Fast Refresh deja la pantalla abierta): header "Cancha", "No encontramos esta cancha" y "Volver al mapa" funciona (CA19 de 01-navigation). **Deshago el cambio**, sin commit.
- [ ] F04-CA09 — `npx tsc --noEmit`, `npx expo lint` y `npx jest` pasan. `PantallaDetalleCancha` no importa servicios y no pasa de ~150 líneas; NetInfo solo aparece como `useNetInfo` (§4, §6). No queda texto provisional.

---

## Tasks

Cada task ≈ un commit. Se hacen después de F03.

- [x] **F04.1 — `NOMBRES_AFLUENCIA`** en `configuracion.ts`.
- [x] **F04.2 — Crear `TarjetaAfluencia`.**
- [x] **F04.3 — Título con el nombre de la cancha** (`useLayoutEffect` en `PantallaDetalleCancha`).
- [x] **F04.4 — `TarjetaAfluencia` en `PantallaDetalleCancha`**, arriba del `PanelCheckIn`, con `useNetInfo` y la regla del "?".
- [ ] **F04.5 — Probar en el iPhone** F04-CA01–CA09, CA13 y CA19 de 01-navigation.

---

## Decisiones resueltas

- **Versión mínima** (00-project): nombre, nivel de afluencia y botón de check-in. Nada más.
- **Nombre:** solo en el header; los nombres largos se cortan con "…".
- **Nivel:** burbuja con número y color (F02) + "N jugadores · Nombre del nivel" (sin el significado de RN07).
- **Sin datos:** "?" y texto, **sin** botón de reintentar; se actualiza desde el Mapa.
- **Conteo:** el mismo `resumen` del Mapa; el detalle no hace peticiones.