import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import type { User } from 'firebase/auth';

import type { Usuario } from '../tipos/usuario';
import { auth } from './firebase';
import { verificarConexion } from './servicioConexion';

/**
 * Convierte el usuario de Firebase en el Usuario de la app.
 * Firebase tipa email y displayName como "texto o null"; aquí null se vuelve ''.
 */
export function convertirUsuario(usuarioFirebase: User): Usuario {
  return {
    idUsuario: usuarioFirebase.uid,
    correo: usuarioFirebase.email ?? '',
    nombre: usuarioFirebase.displayName ?? '',
  };
}

/**
 * Crea la cuenta y guarda el nombre en displayName (F01). Recibe los datos ya limpios.
 * Al crearla, Firebase ya inicia la sesión solo.
 * Si updateProfile falla, la cuenta ya existe: no lanza el error y devuelve
 * el usuario con nombre '' (E15 de 02-data-model).
 * @throws Error('sin-conexion') o un FirebaseError (auth/...)
 */
export async function crearCuenta(
  nombre: string,
  correo: string,
  contrasena: string,
): Promise<Usuario> {
  await verificarConexion();
  const credencial = await createUserWithEmailAndPassword(auth, correo, contrasena);

  try {
    await updateProfile(credencial.user, { displayName: nombre });
    return { ...convertirUsuario(credencial.user), nombre };
  } catch (error) {
    console.error('crearCuenta (updateProfile):', error);
    return { ...convertirUsuario(credencial.user), nombre: '' };
  }
}

/**
 * Inicia sesión con correo y contraseña (F01). Devuelve void: el usuario
 * llega por escucharCambiosDeSesion.
 * @throws Error('sin-conexion') o un FirebaseError (auth/...)
 */
export async function entrarConCorreo(correo: string, contrasena: string): Promise<void> {
  await verificarConexion();
  await signInWithEmailAndPassword(auth, correo, contrasena);
}

/**
 * Cierra la sesión de Firebase (F01). No llama a verificarConexion():
 * cerrar sesión debe funcionar sin internet.
 * @throws un FirebaseError (muy raro)
 */
export async function salirDeFirebase(): Promise<void> {
  await signOut(auth);
}

/**
 * Avisa cada vez que cambia la sesión: con el usuario, o con null si no hay.
 * No llama a verificarConexion(): la app debe abrir sin internet con la sesión guardada.
 * Devuelve la función para dejar de escuchar.
 */
export function escucharCambiosDeSesion(alCambiar: (usuario: Usuario | null) => void): () => void {
  return onAuthStateChanged(auth, (usuarioFirebase) => {
    if (usuarioFirebase === null) {
      alCambiar(null);
    } else {
      alCambiar(convertirUsuario(usuarioFirebase));
    }
  });
}
