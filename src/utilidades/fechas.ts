/**
 * Devuelve el día local de `ahora` como texto 'AAAA-MM-DD' (RN09).
 * Usa getFullYear, getMonth y getDate, que leen la hora local. No usa
 * toISOString(): en Ensenada, después de las 4–5 p. m., ese ya marca el día
 * siguiente porque trabaja en UTC (02-data-model, Fechas).
 */
export function obtenerFechaHoy(ahora: Date): string {
  const anio = ahora.getFullYear();
  // getMonth() empieza en 0 (enero = 0), por eso se le suma 1
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/**
 * Revisa que una fecha 'AAAA-MM-DD' exista en el calendario.
 * Ejemplo: '2026-02-30' → false.
 */
export function esFechaReal(fecha: string): boolean {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  // new Date "corrige" los días que no existen: el 30 de febrero lo vuelve
  // 2 de marzo. Si al leerla de vuelta cambió algo, la fecha no existía.
  const fechaArmada = new Date(anio, mes - 1, dia);
  return (
    fechaArmada.getFullYear() === anio &&
    fechaArmada.getMonth() === mes - 1 &&
    fechaArmada.getDate() === dia
  );
}
