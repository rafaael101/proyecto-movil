// Excepción 1 de coding-standards §4: aquí se importa FirebaseError para leer error.code
import { FirebaseError } from 'firebase/app';

// Se usa para 'sin-conexion' y para auth/network-request-failed (F01)
const MENSAJE_SIN_CONEXION = 'No hay conexión. Revisa tu internet e intenta de nuevo.';

// Record<string, string>: objeto cuyas llaves son el código de Firebase y los valores, el mensaje.
const MENSAJES_FIREBASE: Record<string, string> = {
  // Firestore (02-data-model)
  unavailable: 'No pudimos conectar con el servidor. Intenta de nuevo.',
  'deadline-exceeded': 'El servidor tardó demasiado. Intenta de nuevo.',
  'permission-denied': 'No tienes permiso para hacer esto.',
  'not-found': 'Este partido ya no existe.',
  unauthenticated: 'Tu sesión terminó. Vuelve a iniciar sesión.',
  // Firebase Auth (F01). Contraseña incorrecta y correo sin cuenta dan el mismo
  // código, así no se revela si un correo tiene cuenta.
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/email-already-in-use': 'Ya existe una cuenta con este correo.',
  'auth/invalid-email': 'Correo no válido.',
  'auth/weak-password': 'La contraseña es muy débil.',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos e intenta de nuevo.',
  'auth/network-request-failed': MENSAJE_SIN_CONEXION,
};

/**
 * Traduce cualquier error a un mensaje en español para el usuario.
 * Recibe `unknown` porque en un catch puede llegar cualquier cosa.
 * El detalle técnico no se muestra: el store lo manda a console.error.
 */
export function obtenerMensajeError(error: unknown): string {
  // Lo lanza verificarConexion() cuando no hay internet (E1)
  if (error instanceof Error && error.message === 'sin-conexion') {
    return MENSAJE_SIN_CONEXION;
  }

  if (error instanceof FirebaseError) {
    const mensaje = MENSAJES_FIREBASE[error.code];
    if (mensaje !== undefined) {
      return mensaje;
    }
  }

  return 'Algo salió mal. Intenta de nuevo.';
}
