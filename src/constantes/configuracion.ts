import type { Region } from 'react-native-maps';

export const CHECK_IN_DURACION_MINUTOS = 90; // RN01
export const CHECK_IN_DISTANCIA_MAXIMA_METROS = 150; // RN02 (la usa F03)
export const PARTIDOS_POR_PAGINA = 10; // F06
export const ESTADISTICA_MAXIMA = 100; // RN09: puntos, rebotes y asistencias
export const MARCADOR_MAXIMO = 200; // RN09: marcador final
export const NOMBRE_LONGITUD_MINIMA = 2; // F01
export const NOMBRE_LONGITUD_MAXIMA = 30; // F01
export const CONTRASENA_LONGITUD_MINIMA = 6; // F01 (igual al mínimo de Firebase)
export const CLAVE_CACHE_HISTORIAL = 'hoopsmap.historial'; // RN11

// Región inicial del mapa: centro y margen de las 7 canchas públicas de RN05 (F02).
// No usa la ubicación del usuario ni la cancha de prueba.
// Region es un tipo de react-native-maps: sus campos van en inglés porque son de la librería.
export const REGION_INICIAL: Region = {
  latitude: 31.866,
  longitude: -116.618,
  latitudeDelta: 0.06,
  longitudeDelta: 0.13,
};
