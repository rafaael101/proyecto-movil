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
