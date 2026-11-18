import { esFechaReal, obtenerFechaHoy } from './fechas';

// CAD16
describe('obtenerFechaHoy', () => {
  it('a las 23:30 del 2 de noviembre devuelve el mismo día, no el siguiente', () => {
    // new Date(año, mes, día, hora, minuto) arma la fecha en la hora local de
    // quien corre la prueba, igual que el iPhone en Ensenada. Así el resultado
    // no depende de la zona horaria de la laptop y no hay que simular el reloj.
    // (El mes empieza en 0: 10 = noviembre.)
    const ahora = new Date(2026, 10, 2, 23, 30);
    expect(obtenerFechaHoy(ahora)).toBe('2026-11-02');
  });

  it('pone un cero a la izquierda en mes y día de un dígito', () => {
    const ahora = new Date(2026, 2, 5, 10, 0);
    expect(obtenerFechaHoy(ahora)).toBe('2026-03-05');
  });
});

// CAD16
describe('esFechaReal', () => {
  it('devuelve false para el 30 de febrero', () => {
    expect(esFechaReal('2026-02-30')).toBe(false);
  });

  it('devuelve true para un día que sí existe', () => {
    expect(esFechaReal('2026-11-02')).toBe(true);
  });

  it('acepta el 29 de febrero solo en año bisiesto', () => {
    expect(esFechaReal('2028-02-29')).toBe(true);
    expect(esFechaReal('2026-02-29')).toBe(false);
  });
});
