import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';

import type { CheckIn, ResumenAfluencia } from '../tipos/checkIn';
import { contarJugadoresPorCancha } from '../utilidades/afluencia';
import { calcularExpiracion, calcularLimiteActivos } from '../utilidades/checkIns';
import { baseDeDatos } from './firebase';
import { verificarConexion } from './servicioConexion';

// Lo que guarda Firestore en checkins/{idUsuario}. Timestamp es un tipo de Firebase:
// por eso se declara aquí y no en src/tipos/ (los tipos de la app no importan Firebase)
type DocumentoCheckIn = {
  idCancha: string;
  creadoEn: Timestamp;
};

/**
 * Hace check-in en una cancha (operación 1, RN01, RN03, RN05).
 * El id del documento es el uid: si ya había un check-in, setDoc lo reemplaza (RN03).
 * creadoEn = hora del servidor, no la del teléfono (las reglas lo exigen).
 * No revisa la distancia (RN02): eso lo hace F03 con el GPS antes de llamarla.
 * @throws Error('sin-conexion') o un FirebaseError (permission-denied, unavailable)
 */
export async function crearCheckIn(idUsuario: string, idCancha: string): Promise<void> {
  await verificarConexion();
  await setDoc(doc(baseDeDatos, 'checkins', idUsuario), {
    idCancha,
    creadoEn: serverTimestamp(),
  });
}

/**
 * Termina el check-in del usuario: "Ya me voy" (operación 2, RN04).
 * Si ya no existía (por ejemplo, ya venció), deleteDoc no da error (E7 de 02-data-model).
 * @throws Error('sin-conexion') o un FirebaseError (permission-denied, unavailable)
 */
export async function terminarCheckIn(idUsuario: string): Promise<void> {
  await verificarConexion();
  await deleteDoc(doc(baseDeDatos, 'checkins', idUsuario));
}

/**
 * Cuenta los jugadores activos por cancha (operación 3, RN01, RN06, RN07).
 * Solo trae los check-ins de los últimos 90 min: los vencidos no se cuentan (E6).
 * Del check-in propio arma miCheckIn; de los demás solo toma idCancha, así los
 * uids ajenos no salen de este archivo (RN06).
 * @throws Error('sin-conexion') o un FirebaseError (unavailable, permission-denied)
 */
export async function obtenerCheckInsActivos(idUsuario: string): Promise<ResumenAfluencia> {
  await verificarConexion();
  const limite = calcularLimiteActivos(new Date());
  const consulta = query(collection(baseDeDatos, 'checkins'), where('creadoEn', '>', limite));
  const resultado = await getDocs(consulta);

  const idsCancha: string[] = [];
  let miCheckIn: CheckIn | null = null;
  for (const documento of resultado.docs) {
    // documento.data() no trae tipo: "as DocumentoCheckIn" porque puedo confiar en la
    // forma, ya que las reglas de Firestore no dejan guardar otra (02-data-model)
    const datos = documento.data() as DocumentoCheckIn;
    idsCancha.push(datos.idCancha); // el propio sí cuenta en su cancha
    if (documento.id === idUsuario) {
      const creadoEn = datos.creadoEn.toDate(); // Timestamp de Firebase → Date
      miCheckIn = {
        idUsuario,
        idCancha: datos.idCancha,
        creadoEn,
        expiraEn: calcularExpiracion(creadoEn),
      };
    }
  }

  return { jugadoresPorCancha: contarJugadoresPorCancha(idsCancha), miCheckIn };
}
