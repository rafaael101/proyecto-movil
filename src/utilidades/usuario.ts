/**
 * Devuelve el nombre que se muestra del usuario, o "Jugador" si está vacío
 * (pasa cuando la cuenta se creó pero no se pudo guardar el nombre, E15 de 02-data-model).
 * La usan Perfil (F01) y la tarjeta de jugador (F07).
 */
export function obtenerNombreVisible(nombre: string): string {
  if (nombre === '') {
    return 'Jugador';
  }
  return nombre;
}
