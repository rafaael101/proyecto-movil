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

// Meses abreviados en español; el índice es el de getMonth() (enero = 0)
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/**
 * Convierte la fecha de un partido 'AAAA-MM-DD' en texto para la fila del Historial
 * (F06). Ejemplo: '2026-11-02' → '2 nov 2026'.
 * Separa el texto con split('-') y no usa new Date: new Date('2026-11-02') lo lee
 * como medianoche en UTC, y en Ensenada daría el 1 de noviembre.
 */
export function formatearFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  return `${dia} ${MESES[mes - 1]} ${anio}`;
}

/**
 * Convierte el instante ISO de la caché (guardadoEn) en fecha y hora local para el
 * aviso sin conexión (F06). Ejemplo en Ensenada: '2026-11-03T02:40:00.000Z' → '2 nov, 18:40'.
 * Aquí sí se usa new Date: el texto ISO trae la hora exacta y se quiere verla en hora local.
 */
export function formatearFechaHora(iso: string): string {
  const fecha = new Date(iso);
  // Minutos con 2 dígitos: 18:05, no 18:5
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  return `${fecha.getDate()} ${MESES[fecha.getMonth()]}, ${fecha.getHours()}:${minutos}`;
}
