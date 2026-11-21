import { CANCHAS } from '../constantes/canchas';
import type { Cancha } from '../tipos/cancha';

/**
 * Busca una cancha del catálogo por su id (RN05).
 * Devuelve undefined si no existe; quien la llama decide qué mostrar
 * (por ejemplo, el caso E1 de 01-navigation).
 */
export function buscarCancha(idCancha: string): Cancha | undefined {
  return CANCHAS.find((cancha) => cancha.idCancha === idCancha);
}

/**
 * Nombre de la cancha para la fila del Historial (F06).
 * null → "Sin cancha"; si ya no está en el catálogo (por ejemplo, la cancha de
 * prueba) → "Cancha no disponible" (E16 de 02-data-model).
 */
export function obtenerNombreCancha(idCancha: string | null): string {
  if (idCancha === null) {
    return 'Sin cancha';
  }
  const cancha = buscarCancha(idCancha);
  return cancha === undefined ? 'Cancha no disponible' : cancha.nombre;
}
