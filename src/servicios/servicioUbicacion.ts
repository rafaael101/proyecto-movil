import * as Location from 'expo-location';

import type { Coordenadas } from '../tipos/cancha';

// Único archivo que importa expo-location (§4). Los permisos se piden desde un
// servicio (§10), no desde la pantalla. Ninguna función llama a verificarConexion():
// el GPS funciona sin internet. La ubicación nunca se guarda (RN06).

/**
 * Revisa el permiso sin mostrar el diálogo de iOS.
 * true solo si ya se negó; "aún no se ha preguntado" cuenta como false.
 */
export async function ubicacionNegada(): Promise<boolean> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status === 'denied';
}

/**
 * Pide el permiso. La primera vez iOS muestra el diálogo de Expo Go; después
 * responde sin preguntar. true si el usuario lo dio.
 */
export async function pedirPermisoUbicacion(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

/**
 * Ubicación actual del teléfono con precisión alta (RN02).
 * @throws Error('sin-ubicacion') si el GPS está apagado o no hay señal
 */
export async function obtenerUbicacionActual(): Promise<Coordenadas> {
  try {
    const ubicacion = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    // coords trae los nombres de la librería en inglés: se pasan a los nuestros
    return { latitud: ubicacion.coords.latitude, longitud: ubicacion.coords.longitude };
  } catch (error) {
    // El detalle técnico va a la consola; el store solo ve 'sin-ubicacion'
    console.error('obtenerUbicacionActual:', error);
    throw new Error('sin-ubicacion');
  }
}
