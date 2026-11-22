import { FirebaseError } from 'firebase/app';

import { obtenerMensajeError } from './errores';

// CAD26
describe('obtenerMensajeError', () => {
  it('traduce el error "sin-conexion"', () => {
    expect(obtenerMensajeError(new Error('sin-conexion'))).toBe(
      'No hay conexión. Revisa tu internet e intenta de nuevo.',
    );
  });

  it('traduce permission-denied de Firebase', () => {
    const error = new FirebaseError('permission-denied', 'Missing or insufficient permissions.');
    expect(obtenerMensajeError(error)).toBe('No tienes permiso para hacer esto.');
  });

  it('devuelve el mensaje genérico con un error desconocido', () => {
    expect(obtenerMensajeError(new Error('algo raro'))).toBe('Algo salió mal. Intenta de nuevo.');
  });

  it('devuelve el mensaje genérico con un código de Firebase que no está en la tabla', () => {
    const error = new FirebaseError('cancelled', 'La operación se canceló.');
    expect(obtenerMensajeError(error)).toBe('Algo salió mal. Intenta de nuevo.');
  });
});

// F01-CA24
describe('obtenerMensajeError con errores de Firebase Auth', () => {
  it('traduce auth/invalid-credential', () => {
    expect(obtenerMensajeError(new FirebaseError('auth/invalid-credential', ''))).toBe(
      'Correo o contraseña incorrectos.',
    );
  });

  it('traduce auth/email-already-in-use', () => {
    expect(obtenerMensajeError(new FirebaseError('auth/email-already-in-use', ''))).toBe(
      'Ya existe una cuenta con este correo.',
    );
  });
});

// F03-CA15
describe('obtenerMensajeError con errores de ubicación', () => {
  it('traduce el error "sin-ubicacion"', () => {
    expect(obtenerMensajeError(new Error('sin-ubicacion'))).toBe(
      'No pudimos obtener tu ubicación. Revisa que esté activada e intenta de nuevo.',
    );
  });
});
