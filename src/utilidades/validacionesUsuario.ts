import {
  CONTRASENA_LONGITUD_MINIMA,
  NOMBRE_LONGITUD_MAXIMA,
  NOMBRE_LONGITUD_MINIMA,
} from '../constantes/configuracion';
import type {
  ErroresInicioSesion,
  ErroresRegistro,
  ValoresInicioSesion,
  ValoresRegistro,
} from '../tipos/usuario';

// Regex de la clase "Validación de Formularios": texto@texto.texto, sin espacios
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

/**
 * Valida el correo (F01): obligatorio después de trim() y con el formato de la clase.
 * Devuelve el mensaje de error o null si está bien.
 */
export function validarCorreo(correo: string): string | null {
  const correoLimpio = correo.trim();

  if (correoLimpio === '') {
    return 'Escribe tu correo';
  }
  if (!FORMATO_CORREO.test(correoLimpio)) {
    return 'Correo no válido';
  }
  return null;
}

/**
 * Valida la contraseña nueva del registro (F01). Sin trim(): un espacio puede
 * ser parte de la contraseña. Mínimo 6 caracteres y al menos un número.
 * Devuelve el mensaje de error o null si está bien.
 */
export function validarContrasena(contrasena: string): string | null {
  if (contrasena === '') {
    return 'Escribe tu contraseña';
  }
  if (contrasena.length < CONTRASENA_LONGITUD_MINIMA) {
    return `Mínimo ${CONTRASENA_LONGITUD_MINIMA} caracteres`;
  }
  if (!/[0-9]/.test(contrasena)) {
    return 'Incluye al menos un número';
  }
  return null;
}

/**
 * Valida el formulario de registro y junta un mensaje por campo con error.
 * Si un campo está bien, no aparece en el resultado.
 */
export function validarRegistro(valores: ValoresRegistro): ErroresRegistro {
  const errores: ErroresRegistro = {};

  const errorNombre = validarNombre(valores.nombre);
  if (errorNombre !== null) {
    errores.nombre = errorNombre;
  }
  const errorCorreo = validarCorreo(valores.correo);
  if (errorCorreo !== null) {
    errores.correo = errorCorreo;
  }
  const errorContrasena = validarContrasena(valores.contrasena);
  if (errorContrasena !== null) {
    errores.contrasena = errorContrasena;
  }
  return errores;
}

/**
 * Valida el formulario de inicio de sesión. Aquí la contraseña solo es
 * obligatoria: la cuenta ya existe y Firebase decide si es correcta.
 */
export function validarInicioSesion(valores: ValoresInicioSesion): ErroresInicioSesion {
  const errores: ErroresInicioSesion = {};

  const errorCorreo = validarCorreo(valores.correo);
  if (errorCorreo !== null) {
    errores.correo = errorCorreo;
  }
  if (valores.contrasena === '') {
    errores.contrasena = 'Escribe tu contraseña';
  }
  return errores;
}
