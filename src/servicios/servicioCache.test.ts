import AsyncStorage from '@react-native-async-storage/async-storage';

import { CLAVE_CACHE_HISTORIAL } from '../constantes/configuracion';
import type { Partido } from '../tipos/partido';
import { borrarCacheHistorial, guardarCacheHistorial, leerCacheHistorial } from './servicioCache';

// AsyncStorage es el simulador oficial de jest.setup.ts: guarda en memoria (§12)

const PARTIDO: Partido = {
  idPartido: 'partido-1',
  fecha: '2026-11-02',
  idCancha: 'sullivan',
  resultado: 'gano',
  puntos: 14,
  rebotes: 6,
  asistencias: 3,
  marcadorPropio: 21,
  marcadorRival: 17,
};

beforeEach(async () => {
  // El simulador guarda los datos entre tests: se empieza vacío cada vez
  await AsyncStorage.clear();
  // leerCacheHistorial avisa con console.error; se silencia para no ensuciar la salida
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('leerCacheHistorial', () => {
  it('devuelve los partidos guardados del mismo usuario', async () => {
    await guardarCacheHistorial('usuario-a', [PARTIDO]);
    const cache = await leerCacheHistorial('usuario-a');
    expect(cache?.idUsuario).toBe('usuario-a');
    expect(cache?.partidos).toEqual([PARTIDO]);
  });

  it('devuelve null si nunca se guardó nada', async () => {
    expect(await leerCacheHistorial('usuario-a')).toBeNull();
  });

  // CAD15
  it('después de cerrar sesión (borrar la caché) devuelve null', async () => {
    await guardarCacheHistorial('usuario-a', [PARTIDO]);
    await borrarCacheHistorial();
    expect(await leerCacheHistorial('usuario-a')).toBeNull();
  });

  // CAD27
  it('con JSON roto devuelve null y borra la clave', async () => {
    await AsyncStorage.setItem(CLAVE_CACHE_HISTORIAL, '{esto no es json');
    expect(await leerCacheHistorial('usuario-a')).toBeNull();
    expect(await AsyncStorage.getItem(CLAVE_CACHE_HISTORIAL)).toBeNull();
  });

  // CAD27
  it('con caché de otro usuario devuelve null y borra la clave', async () => {
    await guardarCacheHistorial('usuario-b', [PARTIDO]);
    expect(await leerCacheHistorial('usuario-a')).toBeNull();
    expect(await AsyncStorage.getItem(CLAVE_CACHE_HISTORIAL)).toBeNull();
  });

  // E4 de 02-data-model (forma incorrecta)
  it('con una forma que no es la esperada devuelve null y borra la clave', async () => {
    await AsyncStorage.setItem(CLAVE_CACHE_HISTORIAL, JSON.stringify({ idUsuario: 'usuario-a' }));
    expect(await leerCacheHistorial('usuario-a')).toBeNull();
    expect(await AsyncStorage.getItem(CLAVE_CACHE_HISTORIAL)).toBeNull();
  });
});
