import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
} from 'firebase/firestore';
import type { QueryDocumentSnapshot } from 'firebase/firestore';

import { PARTIDOS_POR_PAGINA } from '../constantes/configuracion';
import type { DatosPartido, Partido } from '../tipos/partido';
import { baseDeDatos } from './firebase';
import { verificarConexion } from './servicioConexion';

// Los partidos viven en la carpeta de cada usuario: usuarios/{idUsuario}/partidos (RN10).
// La app siempre arma la ruta con el uid de la sesión (E11 de 02-data-model).

// El último documento que se leyó: dice dónde sigue la siguiente página.
// Es el único tipo de Firebase que sale del servicio: el store lo guarda tal cual
// y lo regresa aquí, sin leerlo (02-data-model). Por eso no va en src/tipos/.
export type CursorPartidos = QueryDocumentSnapshot;

// Una página del historial (F06)
export type PaginaPartidos = {
  partidos: Partido[];
  cursor: CursorPartidos | null; // dónde continuar; null si no hay más
  hayMas: boolean;
};

// Convierte un documento de Firestore en un Partido de la app.
// documento.data() no trae tipo: se usa "as DatosPartido" porque puedo confiar en la
// forma, ya que las reglas de Firestore no dejan guardar otra (02-data-model).
function convertirDocumento(documento: QueryDocumentSnapshot): Partido {
  const datos = documento.data() as DatosPartido;
  return { idPartido: documento.id, ...datos };
}

/**
 * Crea un partido con datos YA VALIDADOS (operación 4, RN09, RN10).
 * Firestore genera el id con addDoc; se devuelve el partido completo con ese id.
 * @throws Error('sin-conexion') o un FirebaseError (permission-denied, unavailable)
 */
export async function crearPartido(idUsuario: string, datos: DatosPartido): Promise<Partido> {
  await verificarConexion();
  const referencia = await addDoc(collection(baseDeDatos, 'usuarios', idUsuario, 'partidos'), datos);
  return { idPartido: referencia.id, ...datos };
}

/**
 * Reemplaza los datos de un partido (operación 6, RN09, RN10).
 * updateDoc falla si el documento ya no existe: así se detecta el caso
 * "lo borré desde otro teléfono" (E12 de 02-data-model).
 * @throws Error('sin-conexion') o un FirebaseError (not-found, permission-denied, unavailable)
 */
export async function editarPartido(
  idUsuario: string,
  idPartido: string,
  datos: DatosPartido,
): Promise<Partido> {
  await verificarConexion();
  await updateDoc(doc(baseDeDatos, 'usuarios', idUsuario, 'partidos', idPartido), datos);
  return { idPartido, ...datos };
}

/**
 * Borra un partido (operación 7, RN10). Si ya no existía, deleteDoc no da error
 * (E13 de 02-data-model).
 * @throws Error('sin-conexion') o un FirebaseError (permission-denied, unavailable)
 */
export async function eliminarPartido(idUsuario: string, idPartido: string): Promise<void> {
  await verificarConexion();
  await deleteDoc(doc(baseDeDatos, 'usuarios', idUsuario, 'partidos', idPartido));
}

/**
 * Trae una página de 10 partidos, del más reciente al más viejo (operación 5, RN10, F06).
 * Con cursor = null trae la primera página; con cursor, la que sigue después de él.
 * hayMas es true si llegó una página llena: con exactamente 10, 20… partidos se hace
 * una petición extra que regresa vacía (E18 de 02-data-model, aceptado por simple).
 * @throws Error('sin-conexion') o un FirebaseError (unavailable, permission-denied)
 */
export async function obtenerPaginaPartidos(
  idUsuario: string,
  cursor: CursorPartidos | null,
): Promise<PaginaPartidos> {
  await verificarConexion();
  const coleccion = collection(baseDeDatos, 'usuarios', idUsuario, 'partidos');
  const consulta =
    cursor === null
      ? query(coleccion, orderBy('fecha', 'desc'), limit(PARTIDOS_POR_PAGINA))
      : query(coleccion, orderBy('fecha', 'desc'), startAfter(cursor), limit(PARTIDOS_POR_PAGINA));
  const resultado = await getDocs(consulta);
  const documentos = resultado.docs;

  return {
    partidos: documentos.map(convertirDocumento),
    // El último documento leído; si la página llegó vacía, no hay dónde continuar
    cursor: documentos.length > 0 ? documentos[documentos.length - 1] : null,
    hayMas: documentos.length === PARTIDOS_POR_PAGINA,
  };
}

/**
 * Trae todos los partidos del usuario, del más reciente al más viejo (operación de
 * apoyo). Es la misma consulta que obtenerPaginaPartidos, sin limit: la usan los
 * promedios de Perfil y la caché sin conexión (F06, RN11).
 * @throws Error('sin-conexion') o un FirebaseError (unavailable, permission-denied)
 */
export async function obtenerTodosLosPartidos(idUsuario: string): Promise<Partido[]> {
  await verificarConexion();
  const coleccion = collection(baseDeDatos, 'usuarios', idUsuario, 'partidos');
  const resultado = await getDocs(query(coleccion, orderBy('fecha', 'desc')));
  return resultado.docs.map(convertirDocumento);
}
