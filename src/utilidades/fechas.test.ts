import { esFechaReal, formatearFecha, formatearFechaHora, obtenerFechaHoy } from './fechas';

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

// F06-CA13
describe('formatearFecha', () => {
  it('devuelve el mismo día del texto, no el anterior', () => {
    expect(formatearFecha('2026-11-02')).toBe('2 nov 2026');
  });

  it('quita el cero de la izquierda del día', () => {
    expect(formatearFecha('2026-01-05')).toBe('5 ene 2026');
  });
});

// F06-CA13
describe('formatearFechaHora', () => {
  it('muestra la hora local con los minutos en 2 dígitos', () => {
    // new Date(año, mes, día, hora, minuto) se arma en hora local, igual que en el
    // iPhone; toISOString la pasa a UTC y la función la regresa a hora local
    const iso = new Date(2026, 10, 2, 18, 5).toISOString();
    expect(formatearFechaHora(iso)).toBe('2 nov, 18:05');
  });
});
