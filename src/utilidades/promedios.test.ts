import type { Partido } from '../tipos/partido';
import { calcularPromedios } from './promedios';

// Arma un partido de prueba; solo cambian resultado y estadísticas
function crearPartido(
  idPartido: string,
  resultado: Partido['resultado'],
  puntos: number,
  rebotes: number,
  asistencias: number,
): Partido {
  return {
    idPartido,
    fecha: '2026-11-02',
    idCancha: null,
    resultado,
    puntos,
    rebotes,
    asistencias,
    marcadorPropio: null,
    marcadorRival: null,
  };
}

// CAD25
describe('calcularPromedios', () => {
  it('con 3 partidos cuenta victorias y promedia por partido', () => {
    const partidos = [
      crearPartido('a', 'gano', 10, 4, 2),
      crearPartido('b', 'perdio', 15, 5, 1),
      crearPartido('c', 'gano', 20, 7, 1),
    ];
    expect(calcularPromedios(partidos)).toEqual({
      partidosJugados: 3,
      victorias: 2,
      puntos: 15,
      rebotes: 5.3, // 16 / 3 = 5.333… → 1 decimal
      asistencias: 1.3, // 4 / 3 = 1.333…
    });
  });

  it('con 0 partidos devuelve todo en 0, sin NaN', () => {
    expect(calcularPromedios([])).toEqual({
      partidosJugados: 0,
      victorias: 0,
      puntos: 0,
      rebotes: 0,
      asistencias: 0,
    });
  });
});
