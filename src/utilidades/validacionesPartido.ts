import { ESTADISTICA_MAXIMA, MARCADOR_MAXIMO } from '../constantes/configuracion';
import type {
  DatosPartido,
  ErroresPartido,
  Partido,
  ResultadoPartido,
  ValoresFormularioPartido,
} from '../tipos/partido';
import { buscarCancha } from './canchas';
import { esFechaReal } from './fechas';

// Formato 'AAAA-MM-DD': 4 dígitos, guion, 2 dígitos, guion, 2 dígitos
const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;
// Solo dígitos: así quedan fuera los negativos ('-3') y los decimales ('4.5')
const SOLO_DIGITOS = /^\d+$/;

/**
 * Valida la fecha del partido (RN09): obligatoria, formato 'AAAA-MM-DD',
 * día real y no después de `hoy`. `hoy` llega como parámetro para que la
 * función sea pura (02-data-model).
 */
export function validarFecha(fecha: string, hoy: string): string | null {
  const fechaLimpia = fecha.trim();

  if (fechaLimpia === '') {
    return 'Escribe la fecha del partido';
  }
  if (!FORMATO_FECHA.test(fechaLimpia) || !esFechaReal(fechaLimpia)) {
    return 'Fecha no válida';
  }
  // Con el formato 'AAAA-MM-DD', comparar los textos da el mismo orden que las fechas
  if (fechaLimpia > hoy) {
    return 'La fecha no puede ser futura';
  }
  return null;
}

/**
 * Valida la cancha (RN09 y RN05): es opcional (null = sin cancha), pero si
 * viene debe existir en el catálogo.
 */
export function validarCancha(idCancha: string | null): string | null {
  if (idCancha !== null && buscarCancha(idCancha) === undefined) {
    return 'Elige una cancha de la lista';
  }
  return null;
}

/** Valida que el usuario haya elegido "Ganó" o "Perdió" (RN09). */
export function validarResultado(resultado: ResultadoPartido | null): string | null {
  if (resultado === null) {
    return 'Indica si ganaste o perdiste';
  }
  return null;
}

/**
 * Valida puntos, rebotes o asistencias (RN09, RN08): obligatorio, entero
 * de 0 a 100. `nombreCampo` arma el mensaje ("Escribe tus puntos").
 */
export function validarEstadistica(texto: string, nombreCampo: string): string | null {
  const textoLimpio = texto.trim();

  if (textoLimpio === '') {
    return `Escribe tus ${nombreCampo}`;
  }
  if (!SOLO_DIGITOS.test(textoLimpio)) {
    return 'Usa solo números enteros';
  }
  if (Number(textoLimpio) > ESTADISTICA_MAXIMA) {
    return `Máximo ${ESTADISTICA_MAXIMA}`;
  }
  return null;
}

/**
 * Valida el marcador final (RN09). Es opcional, pero van los dos o ninguno.
 * Si hay varios problemas, devuelve el primero en el orden de la tabla de
 * 02-data-model. La regla de los puntos solo se revisa si `puntos` es un
 * entero válido (si no, ese error ya lo da validarEstadistica).
 */
export function validarMarcador(
  propio: string,
  rival: string,
  resultado: ResultadoPartido | null,
  puntos: string,
): string | null {
  const propioLimpio = propio.trim();
  const rivalLimpio = rival.trim();

  if (propioLimpio === '' && rivalLimpio === '') {
    return null; // sin marcador: está bien
  }
  if (propioLimpio === '' || rivalLimpio === '') {
    return 'Escribe los dos marcadores o deja ambos vacíos';
  }
  if (!SOLO_DIGITOS.test(propioLimpio) || !SOLO_DIGITOS.test(rivalLimpio)) {
    return 'Usa solo números enteros';
  }

  const marcadorPropio = Number(propioLimpio);
  const marcadorRival = Number(rivalLimpio);

  if (marcadorPropio > MARCADOR_MAXIMO || marcadorRival > MARCADOR_MAXIMO) {
    return `Máximo ${MARCADOR_MAXIMO}`;
  }
  if (marcadorPropio === marcadorRival) {
    return 'En básquet no hay empates';
  }
  if (resultado === 'gano' && marcadorPropio < marcadorRival) {
    return 'Si ganaste, tu marcador debe ser mayor';
  }
  if (resultado === 'perdio' && marcadorPropio > marcadorRival) {
    return 'Si perdiste, tu marcador debe ser menor';
  }
  const puntosLimpios = puntos.trim();
  if (SOLO_DIGITOS.test(puntosLimpios) && Number(puntosLimpios) > marcadorPropio) {
    return 'Tus puntos no pueden ser más que los de tu equipo';
  }
  return null;
}

/**
 * Valida todo el formulario de partido y junta un mensaje por campo con error.
 * Si un campo está bien, no aparece en el resultado. El error del marcador se
 * guarda en marcadorPropio (abarca los dos campos).
 */
export function validarPartido(valores: ValoresFormularioPartido, hoy: string): ErroresPartido {
  const errores: ErroresPartido = {};

  const errorFecha = validarFecha(valores.fecha, hoy);
  if (errorFecha !== null) {
    errores.fecha = errorFecha;
  }
  const errorCancha = validarCancha(valores.idCancha);
  if (errorCancha !== null) {
    errores.idCancha = errorCancha;
  }
  const errorResultado = validarResultado(valores.resultado);
  if (errorResultado !== null) {
    errores.resultado = errorResultado;
  }
  const errorPuntos = validarEstadistica(valores.puntos, 'puntos');
  if (errorPuntos !== null) {
    errores.puntos = errorPuntos;
  }
  const errorRebotes = validarEstadistica(valores.rebotes, 'rebotes');
  if (errorRebotes !== null) {
    errores.rebotes = errorRebotes;
  }
  const errorAsistencias = validarEstadistica(valores.asistencias, 'asistencias');
  if (errorAsistencias !== null) {
    errores.asistencias = errorAsistencias;
  }
  const errorMarcador = validarMarcador(
    valores.marcadorPropio,
    valores.marcadorRival,
    valores.resultado,
    valores.puntos,
  );
  if (errorMarcador !== null) {
    errores.marcadorPropio = errorMarcador;
  }
  return errores;
}

/** Devuelve true si el objeto de errores tiene al menos un mensaje. */
export function hayErrores(errores: ErroresPartido): boolean {
  return Object.values(errores).some((mensaje) => mensaje !== undefined);
}

// Convierte el texto de un marcador: vacío → null; si no, número
function convertirMarcador(texto: string): number | null {
  const textoLimpio = texto.trim();
  return textoLimpio === '' ? null : Number(textoLimpio);
}

/**
 * Convierte un formulario YA VÁLIDO en los datos que se mandan a Firestore:
 * textos a número con Number(...) y marcador vacío → null.
 */
export function convertirAPartido(valores: ValoresFormularioPartido): DatosPartido {
  return {
    fecha: valores.fecha.trim(),
    idCancha: valores.idCancha,
    // El formulario ya pasó validarResultado, así que aquí nunca es null.
    // Se escribe así para no usar "!" ni "as" (§5)
    resultado: valores.resultado === 'gano' ? 'gano' : 'perdio',
    puntos: Number(valores.puntos.trim()),
    rebotes: Number(valores.rebotes.trim()),
    asistencias: Number(valores.asistencias.trim()),
    marcadorPropio: convertirMarcador(valores.marcadorPropio),
    marcadorRival: convertirMarcador(valores.marcadorRival),
  };
}

// Convierte un marcador guardado en texto: null → ''; si no, el número como texto
function convertirMarcadorATexto(marcador: number | null): string {
  return marcador === null ? '' : String(marcador);
}

/**
 * Al revés que convertirAPartido: llena el formulario con un partido
 * guardado, para el modo editar (F05).
 */
export function convertirAValores(partido: Partido): ValoresFormularioPartido {
  return {
    fecha: partido.fecha,
    idCancha: partido.idCancha,
    resultado: partido.resultado,
    puntos: String(partido.puntos),
    rebotes: String(partido.rebotes),
    asistencias: String(partido.asistencias),
    marcadorPropio: convertirMarcadorATexto(partido.marcadorPropio),
    marcadorRival: convertirMarcadorATexto(partido.marcadorRival),
  };
}
