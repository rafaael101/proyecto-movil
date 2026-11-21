import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';

import type { DatosPartido, Partido } from '../tipos/partido';
import { baseDeDatos } from './firebase';
import { verificarConexion } from './servicioConexion';

// Los partidos viven en la carpeta de cada usuario: usuarios/{idUsuario}/partidos (RN10).
// La app siempre arma la ruta con el uid de la sesión (E11 de 02-data-model).

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
