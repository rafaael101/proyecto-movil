import { NOMBRE_LONGITUD_MAXIMA, NOMBRE_LONGITUD_MINIMA } from '../constantes/configuracion';

/**
 * Valida el nombre del registro (F01): obligatorio, de 2 a 30 caracteres
 * después de quitar los espacios de las orillas con trim().
 * Devuelve el mensaje de error o null si está bien.
 */
export function validarNombre(nombre: string): string | null {
  const nombreLimpio = nombre.trim();

  if (nombreLimpio === '') {
    return 'Escribe tu nombre';
  }
  if (nombreLimpio.length < NOMBRE_LONGITUD_MINIMA) {
    return `Mínimo ${NOMBRE_LONGITUD_MINIMA} caracteres`;
  }
  if (nombreLimpio.length > NOMBRE_LONGITUD_MAXIMA) {
    return `Máximo ${NOMBRE_LONGITUD_MAXIMA} caracteres`;
  }
  return null;
}
