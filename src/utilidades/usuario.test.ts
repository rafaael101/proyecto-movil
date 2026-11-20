import { obtenerNombreVisible } from './usuario';

// F01-CA25
describe('obtenerNombreVisible', () => {
  it('devuelve "Jugador" si el nombre está vacío', () => {
    expect(obtenerNombreVisible('')).toBe('Jugador');
  });

  it('devuelve el nombre si tiene texto', () => {
    expect(obtenerNombreVisible('Ana')).toBe('Ana');
  });
});
