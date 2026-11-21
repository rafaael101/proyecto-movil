import { obtenerNombreCancha } from './canchas';

// F06-CA13
describe('obtenerNombreCancha', () => {
  it('sin cancha devuelve "Sin cancha"', () => {
    expect(obtenerNombreCancha(null)).toBe('Sin cancha');
  });

  it('con una cancha que no está en el catálogo devuelve "Cancha no disponible"', () => {
    expect(obtenerNombreCancha('no-existe')).toBe('Cancha no disponible');
  });

  it('con una cancha del catálogo devuelve su nombre', () => {
    expect(obtenerNombreCancha('sullivan')).toBe('Unidad Deportiva Juan A. Rodríguez Sullivan');
  });
});
