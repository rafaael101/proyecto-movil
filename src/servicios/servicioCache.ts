import AsyncStorage from '@react-native-async-storage/async-storage';

import { CLAVE_CACHE_HISTORIAL } from '../constantes/configuracion';
import type { CacheHistorial, Partido } from '../tipos/partido';

// Caché del historial en AsyncStorage para verlo sin internet (RN11, clase Persistencia).
// No llama a verificarConexion(): AsyncStorage vive en el teléfono.

// Revisa que lo leído tenga la forma de CacheHistorial. Recibe unknown porque
// JSON.parse puede devolver cualquier cosa. "valor is CacheHistorial" le dice a
// TypeScript que, si devuelve true, ya es una CacheHistorial (así no hace falta "as").
function esCacheHistorial(valor: unknown): valor is CacheHistorial {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'idUsuario' in valor &&
    typeof valor.idUsuario === 'string' &&
    'guardadoEn' in valor &&
    typeof valor.guardadoEn === 'string' &&
    'partidos' in valor &&
    Array.isArray(valor.partidos)
  );
}

/**
 * Guarda la última lista COMPLETA de partidos con la hora de guardado (RN11).
 * Se llama cada vez que obtenerTodosLosPartidos sale bien.
 * @throws el error de AsyncStorage (raro)
 */
export async function guardarCacheHistorial(idUsuario: string, partidos: Partido[]): Promise<void> {
  const cache: CacheHistorial = {
    idUsuario,
    guardadoEn: new Date().toISOString(), // instante exacto, para "datos guardados el…"
    partidos,
  };
  // AsyncStorage solo guarda texto: JSON.stringify
  await AsyncStorage.setItem(CLAVE_CACHE_HISTORIAL, JSON.stringify(cache));
}

/**
 * Lee la caché del historial. Devuelve null si no hay nada ("nunca se descargó").
 * Si el JSON está roto, no tiene la forma esperada o es de otro usuario, la borra,
 * lo registra con console.error y devuelve null (E4 y E5 de 02-data-model).
 * @throws el error de AsyncStorage (raro)
 */
export async function leerCacheHistorial(idUsuario: string): Promise<CacheHistorial | null> {
  const texto = await AsyncStorage.getItem(CLAVE_CACHE_HISTORIAL);
  if (texto === null) {
    return null;
  }

  // JSON.parse lanza un error si el texto está roto: siempre dentro de try/catch (clase)
  let datos: unknown;
  try {
    datos = JSON.parse(texto);
  } catch (error) {
    console.error('leerCacheHistorial (JSON roto):', error);
    await borrarCacheHistorial();
    return null;
  }

  if (!esCacheHistorial(datos)) {
    console.error('leerCacheHistorial: la caché no tiene la forma esperada');
    await borrarCacheHistorial();
    return null;
  }
  // Segundo seguro (RN10): si el borrado al cerrar sesión falló, nunca se muestran partidos ajenos
  if (datos.idUsuario !== idUsuario) {
    console.error('leerCacheHistorial: la caché es de otro usuario');
    await borrarCacheHistorial();
    return null;
  }
  return datos;
}

/**
 * Borra la caché del historial. La llama F01 al cerrar sesión (F01.17).
 * @throws el error de AsyncStorage (raro)
 */
export async function borrarCacheHistorial(): Promise<void> {
  await AsyncStorage.removeItem(CLAVE_CACHE_HISTORIAL);
}
