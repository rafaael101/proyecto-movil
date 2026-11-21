import type { NivelAfluencia } from '../tipos/checkIn';

/**
 * Convierte la lista de canchas de los check-ins activos en números (RN06).
 * Ejemplo: ['sullivan', 'sullivan', 'siglo-xxi'] → { sullivan: 2, 'siglo-xxi': 1 }.
 * Lista vacía → {}. Una cancha que no aparece tiene 0 jugadores.
 */
export function contarJugadoresPorCancha(idsCancha: string[]): Record<string, number> {
  const conteo: Record<string, number> = {};
  for (const idCancha of idsCancha) {
    // La primera vez la cancha no está en el objeto: se empieza en 0
    conteo[idCancha] = (conteo[idCancha] ?? 0) + 1;
  }
  return conteo;
}

/**
 * Nivel de afluencia de una cancha (RN07):
 * 0 → vacia · 1–5 → poca · 6–9 → reta · 10 o más → llena.
 */
export function obtenerNivelAfluencia(jugadores: number): NivelAfluencia {
  if (jugadores === 0) {
    return 'vacia';
  }
  if (jugadores <= 5) {
    return 'poca';
  }
  if (jugadores <= 9) {
    return 'reta';
  }
  return 'llena';
}
