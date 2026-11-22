import type { Coordenadas } from '../tipos/cancha';
import { buscarCancha } from './canchas';
import { calcularDistanciaMetros, estaDentroDelRadio } from './distancia';

// Solo coordenadas del catálogo público (RN05), tomadas con buscarCancha.
// Si la cancha no existe el test falla con un mensaje claro (sin usar "!")
function obtenerCoordenadas(idCancha: string): Coordenadas {
  const cancha = buscarCancha(idCancha);
  if (cancha === undefined) {
    throw new Error(`La cancha ${idCancha} no está en el catálogo`);
  }
  return cancha;
}

const SULLIVAN = obtenerCoordenadas('sullivan');

// F03-CA14
describe('calcularDistanciaMetros', () => {
  it('da 0 con el mismo punto', () => {
    expect(calcularDistanciaMetros(SULLIVAN, SULLIVAN)).toBe(0);
  });

  it('da unos 111 m con 0.001° más de latitud', () => {
    const norte = { latitud: SULLIVAN.latitud + 0.001, longitud: SULLIVAN.longitud };
    expect(calcularDistanciaMetros(SULLIVAN, norte)).toBeCloseTo(111, 0);
  });

  it('da unos 95 m con 0.001° más de longitud (corrección por coseno)', () => {
    const este = { latitud: SULLIVAN.latitud, longitud: SULLIVAN.longitud + 0.001 };
    expect(calcularDistanciaMetros(SULLIVAN, este)).toBeCloseTo(95, 0);
  });

  it('de Sullivan al Gimnasio Municipal da entre 1 270 y 1 300 m', () => {
    const distancia = calcularDistanciaMetros(SULLIVAN, obtenerCoordenadas('gimnasio-municipal'));
    expect(distancia).toBeGreaterThanOrEqual(1270);
    expect(distancia).toBeLessThanOrEqual(1300);
  });
});

// F03-CA14
describe('estaDentroDelRadio', () => {
  it('150 m está dentro', () => {
    expect(estaDentroDelRadio(150)).toBe(true);
  });

  it('150.5 m está fuera', () => {
    expect(estaDentroDelRadio(150.5)).toBe(false);
  });
});
