import type { Partido, Promedios } from '../tipos/partido';

// Redondea a 1 decimal: 15.666… → 15.7
function redondearUnDecimal(valor: number): number {
  return Math.round(valor * 10) / 10;
}

/**
 * Calcula los promedios por partido del Perfil (F06).
 * Con 0 partidos devuelve todo en 0: no se divide entre cero, así nunca sale NaN (E17).
 */
export function calcularPromedios(partidos: Partido[]): Promedios {
  const partidosJugados = partidos.length;

  if (partidosJugados === 0) {
    return { partidosJugados: 0, victorias: 0, puntos: 0, rebotes: 0, asistencias: 0 };
  }

  let victorias = 0;
  let totalPuntos = 0;
  let totalRebotes = 0;
  let totalAsistencias = 0;
  for (const partido of partidos) {
    if (partido.resultado === 'gano') {
      victorias = victorias + 1;
    }
    totalPuntos = totalPuntos + partido.puntos;
    totalRebotes = totalRebotes + partido.rebotes;
    totalAsistencias = totalAsistencias + partido.asistencias;
  }

  return {
    partidosJugados,
    victorias,
    puntos: redondearUnDecimal(totalPuntos / partidosJugados),
    rebotes: redondearUnDecimal(totalRebotes / partidosJugados),
    asistencias: redondearUnDecimal(totalAsistencias / partidosJugados),
  };
}
