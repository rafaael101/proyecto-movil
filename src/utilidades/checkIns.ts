import { CHECK_IN_DURACION_MINUTOS } from '../constantes/configuracion';
import type { CheckIn } from '../tipos/checkIn';

const MILISEGUNDOS_POR_MINUTO = 60 * 1000;
// Lo que dura un check-in en milisegundos: 90 min (RN01)
const DURACION_MILISEGUNDOS = CHECK_IN_DURACION_MINUTOS * MILISEGUNDOS_POR_MINUTO;

/**
 * Hora en que vence un check-in: creadoEn + 90 min (RN01). Ejemplo: 18:00 → 19:30.
 * Se calcula en la app; no se guarda en Firestore.
 */
export function calcularExpiracion(creadoEn: Date): Date {
  return new Date(creadoEn.getTime() + DURACION_MILISEGUNDOS);
}

/**
 * Límite para la consulta de activos: los check-ins creados después de esta hora
 * siguen vigentes (RN01). Ejemplo: 19:30 → 18:00.
 */
export function calcularLimiteActivos(ahora: Date): Date {
  return new Date(ahora.getTime() - DURACION_MILISEGUNDOS);
}

/**
 * Minutos que le quedan a un check-in. Redondea hacia arriba: con 30 s restantes
 * dice 1, para no mostrar "0 min" mientras sigue activo. Nunca es negativo:
 * vencido → 0.
 */
export function minutosRestantes(checkIn: CheckIn, ahora: Date): number {
  const restante = checkIn.expiraEn.getTime() - ahora.getTime();
  if (restante <= 0) {
    return 0;
  }
  return Math.ceil(restante / MILISEGUNDOS_POR_MINUTO);
}

/** true si el check-in todavía no vence (RN01). */
export function estaActivo(checkIn: CheckIn, ahora: Date): boolean {
  return checkIn.expiraEn.getTime() > ahora.getTime();
}
