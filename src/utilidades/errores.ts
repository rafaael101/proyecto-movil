// Excepción 1 de coding-standards §4: aquí se importa FirebaseError para leer error.code
import { FirebaseError } from 'firebase/app';

// Record<string, string>: objeto cuyas llaves son el código de Firebase y los valores, el mensaje.
// Los errores auth/... se agregan en F01.3.
const MENSAJES_FIREBASE: Record<string, string> = {
  unavailable: 'No pudimos conectar con el servidor. Intenta de nuevo.',
  'deadline-exceeded': 'El servidor tardó demasiado. Intenta de nuevo.',
  'permission-denied': 'No tienes permiso para hacer esto.',
  'not-found': 'Este partido ya no existe.',
  unauthenticated: 'Tu sesión terminó. Vuelve a iniciar sesión.',
};

/**
 * Traduce cualquier error a un mensaje en español para el usuario.
 * Recibe `unknown` porque en un catch puede llegar cualquier cosa.
 * El detalle técnico no se muestra: el store lo manda a console.error.
 */
export function obtenerMensajeError(error: unknown): string {
  // Lo lanza verificarConexion() cuando no hay internet (E1)
  if (error instanceof Error && error.message === 'sin-conexion') {
    return 'No hay conexión. Revisa tu internet e intenta de nuevo.';
  }

  if (error instanceof FirebaseError) {
    const mensaje = MENSAJES_FIREBASE[error.code];
    if (mensaje !== undefined) {
      return mensaje;
    }
  }

  return 'Algo salió mal. Intenta de nuevo.';
}
