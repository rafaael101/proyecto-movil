# Diario de decisiones — HoopsMap

> **Autor:** Rafael García · **Última actualización:** 2026-11-22
> Cada decisión dice qué se eligió, qué se descartó y por qué. El detalle completo está en la spec que se indica. Cómo usé la IA está en [`bitacora-ia.md`](bitacora-ia.md).

---

## 1. Producto y alcance

| # | Fecha | Decisión | Se descartó | Por qué | Dónde |
|---|---|---|---|---|---|
| 1 | 2 nov | Proyecto individual: cada requisito de la rúbrica **en su mínimo**, sin extras | Modo oscuro, notificaciones, favoritos y otros extras | La rúbrica está pensada para 3 personas | 00-project |
| 2 | 2 nov | **F03 (check-in) es la feature central** | — | Sin check-ins el mapa no aporta nada frente a Google Maps | 00-project, MVP |
| 3 | 2 nov | Check-in de **90 min** (RN01), a **150 m o menos** (RN02), **uno a la vez** (RN03) | Duración variable; check-in sin revisar distancia | Que el mapa refleje la actividad real y evitar check-ins falsos desde casa | 00-project, RN01–RN03 |
| 4 | 2 nov | **Catálogo de 7 canchas fijo en el código** (RN05) | Guardar canchas en Firestore o que los usuarios las creen | Funcionan sin conexión y no hay que administrarlas | 00-project, RN05 |
| 5 | 2 nov | Solo se muestra **el número** de jugadores por cancha (RN06) | Mostrar quiénes están | Privacidad | 00-project, RN06 |
| 6 | 22 nov | La **cancha de prueba** (coordenadas solo en `.env`) se queda para la demostración en clase, con las coordenadas del salón | Quitarla antes de la entrega | Permite mostrar el check-in (RN02) en el salón. Sus coordenadas nunca van en código, specs ni commits porque el repo es público | 00-project RN05 y Riesgos, 02-data-model D18 (`aba9d3b`, `82f92fe`) |

## 2. Tecnología

| # | Fecha | Decisión | Se descartó | Por qué | Dónde |
|---|---|---|---|---|---|
| 7 | 2 nov | **React Navigation configurada a mano** (Native Stack + Bottom Tabs), plantilla `blank-typescript` | Expo Router | Es lo que se enseña en clase; más fácil de defender | 00-project, 01-navigation |
| 8 | 2 nov | **Zustand** para el estado global | Redux, Context | El más sencillo de los que acepta la rúbrica | 00-project |
| 9 | 2 nov | **Firebase** (Auth + Firestore) como backend | Backend propio con SQL | La rúbrica lo nombra y el SDK funciona en Expo Go. Hace falta backend para que otros usuarios vean los check-ins | 00-project |
| 10 | 2 nov | La **sesión de Firebase en AsyncStorage** | SecureStore (lo que se vio en clase) | Es la persistencia que Firebase ofrece para React Native; SecureStore exigiría un adaptador propio | 02-data-model, *Diferencias con lo visto en clase* |
| 11 | 2 nov | **Validación manual + `useFormulario`** | Formik, Yup | Es lo que se enseña en clase; las validaciones son funciones puras fáciles de probar | 00-project, coding-standards §11 |
| 12 | 2 nov | Todo lo que nombramos va **en español**, sin acentos ni ñ (`ParametrosStackRaiz` en vez de `RootStackParamList`) | Nombres en inglés | Más fácil de leer y explicar; el patrón es el mismo de la clase | 00-project, 01-navigation |
| 13 | 2 nov | **Capas:** pantalla → store → servicio → Firebase. Solo `src/servicios/` habla con Firebase, AsyncStorage y NetInfo | Llamar a Firebase desde las pantallas | Si cambia el backend solo cambia `servicios/`, y en la defensa se señala un solo archivo | coding-standards §4 |
| 14 | 21 nov | Distancia con **Pitágoras con corrección por coseno** | Haversine | Se explica línea por línea; a 150 m la diferencia es de centímetros | F03 |
| 15 | 20 nov | **Historial paginado con cursor** de Firestore, páginas de 10, sin `memo` ni `getItemLayout` | Página numérica; optimizaciones extra | Firestore pagina con `startAfter`; con páginas de 10 no hace falta más | F06 |
| 16 | 20 nov | **Sin internet no se encola nada:** el historial se lee de la caché y crear, editar o hacer check-in muestra "No hay conexión" | Cola de acciones sin red | Un check-in encolado mentiría sobre la hora y el lugar | 02-data-model, RN11 |
| 17 | 21 nov | La **foto de la tarjeta no se guarda**; vive en un hook con `useState` | Store de Zustand; guardarla en la galería | Solo la usa una pantalla y debe perderse al cerrar el modal | F07 |

## 3. Excepciones aceptadas al estándar

| # | Fecha | Decisión | Por qué |
|---|---|---|---|
| 18 | 22 nov | **Archivos de más de ~150 líneas (§6) que se quedan así:** `validacionesPartido.ts` (235), `useStorePartidos.ts` (177), `FormularioPartido` (157) y `PantallaHistorial` (152) | `validacionesPartido.ts` reúne todas las validaciones de partido porque así lo pide 02-data-model. `useStorePartidos.ts` es un store, no un componente. Los otros dos se consideran "~150" |
| 19 | 22 nov | **CAD29 incluye `useNetInfo`** | Es la excepción 3 de §4: una pantalla puede usarlo solo para el aviso "Sin conexión" (`e43b2d3`) |
| 20 | 22 nov | **El ref de la tarjeta usa `HostInstance`** y el `View` lleva `collapsable={false}` | En React Native 0.88 `View` es una función y no sirve como tipo del ref; sin `collapsable={false}`, `captureRef` puede no encontrar la vista. La spec se corrigió en `638448a`, commit hecho por Claude Code |

## 4. Diferencias pequeñas entre la spec y el código

| # | Qué dice la spec | Qué quedó | Por qué |
|---|---|---|---|
| 21 | Margen `md` entre `TarjetaAfluencia` y `PanelCheckIn` | `gap` en el `ScrollView` | Se ve igual |
| 22 | — | En `PanelCheckIn`, con "Estás en esta cancha" el mensaje de error se muestra aunque el permiso esté negado. "Abrir Ajustes" se deshabilita mientras la pantalla trabaja (igual en F07) | Se vio al probar F03 y se aceptó: no deja la pantalla en blanco ni cierra la app |
| 23 | F04-CA08 / CA19: probar una cancha que no está en el catálogo | Se probó cambiando un momento el `idCancha` en `canchas.ts`, **sin commit** | Desde la app no se puede llegar a un id inexistente; el cambio era solo para la prueba |

## 5. Proceso y Git

| # | Fecha | Decisión | Por qué |
|---|---|---|---|
| 24 | 2 nov | **Solo rama `main`**, commits en español, una idea por commit, con el id de la task: `agrega dependencias de navegación (N1)` | Clase *Git y Deploy*; proyecto individual |
| 25 | 22 nov | **Claude Code hace un commit local por task, sin `push`**; yo reviso con `git diff --staged --stat` y subo | Antes yo hacía cada commit y era lento; así puedo revisar y defender cada uno (coding-standards v2.3, §17 y §18) |
| 26 | — | **Commits que no se reescriben:** `40a4791` y `5f18a69` tienen mensajes que no corresponden a todo su cambio. Los commits del 2 nov y `306af60` no siguen el formato | Ya están en GitHub y el estándar prohíbe reescribir el historial (`git push --force`). El formato de mensajes se definió en coding-standards después de los primeros commits |

## 6. Entrega

| # | Fecha | Decisión | Se descartó | Por qué |
|---|---|---|---|---|
| 27 | 20 nov | **EAS Update** con `expo-updates` y `runtimeVersion { "policy": "sdkVersion" }` | APK; publicar en tiendas | El profesor usa iPhone; un APK no le sirve y publicar en iOS requiere cuenta de Apple de pago. Expo Go solo abre una actualización cuyo runtime es la versión del SDK |
| 28 | 22 nov | La liga de EAS Update **solo abre en Expo Go para miembros del proyecto** (error 403). Se entrega así, con una nota en Classroom | — | Lo comprobamos con otro dispositivo. La demostración corre desde la laptop con `npx expo start` (00-project, Riesgos) |
| 29 | 22 nov | Las variables de Firebase de la actualización vienen del ambiente **preview** de expo.dev, **sin** las de la cancha de prueba. Se publica con `--environment preview` | Usar el `.env` local | Con `--environment`, `eas update` ignora el `.env`, así que las coordenadas del salón no salen en la liga |
| 30 | 22 nov | Se quita `expo-status-bar` de `plugins` en `app.json`, **sin desinstalarlo**. `expo-sharing` se queda igual | Desinstalarlo | No se usa en el código y los plugins no afectan a Expo Go. Desinstalarlo exigía `npm uninstall`, fuera de §14 |
| 31 | 22 nov | Documentación: **README con la arquitectura** y esta bitácora con su diario | Documento de arquitectura aparte y video demo (los pedía 00-project) | La tarea de Classroom pide solo la liga al repo, la liga de la app y la bitácora con el diario |
