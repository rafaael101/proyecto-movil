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
