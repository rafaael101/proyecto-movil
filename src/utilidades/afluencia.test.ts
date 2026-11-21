import { contarJugadoresPorCancha, obtenerNivelAfluencia } from './afluencia';

// CAD23
describe('contarJugadoresPorCancha', () => {
  it('cuenta cuántos check-ins hay en cada cancha', () => {
    expect(contarJugadoresPorCancha(['sullivan', 'sullivan', 'siglo-xxi'])).toEqual({
      sullivan: 2,
      'siglo-xxi': 1,
    });
  });

  it('con lista vacía devuelve un objeto vacío', () => {
    expect(contarJugadoresPorCancha([])).toEqual({});
  });
});

// CAD24 — RN07
describe('obtenerNivelAfluencia', () => {
  it('devuelve "vacia" con 0 jugadores', () => {
    expect(obtenerNivelAfluencia(0)).toBe('vacia');
  });

  it('devuelve "poca" de 1 a 5 jugadores', () => {
    expect(obtenerNivelAfluencia(1)).toBe('poca');
    expect(obtenerNivelAfluencia(5)).toBe('poca');
  });

  it('devuelve "reta" de 6 a 9 jugadores', () => {
    expect(obtenerNivelAfluencia(6)).toBe('reta');
    expect(obtenerNivelAfluencia(9)).toBe('reta');
  });

  it('devuelve "llena" con 10 jugadores', () => {
    expect(obtenerNivelAfluencia(10)).toBe('llena');
  });
});
