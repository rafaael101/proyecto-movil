import { create } from 'zustand';

import { guardarCacheHistorial, leerCacheHistorial } from '../servicios/servicioCache';
import { hayConexion } from '../servicios/servicioConexion';
import {
  crearPartido,
  editarPartido,
  eliminarPartido,
  obtenerPaginaPartidos,
  obtenerTodosLosPartidos,
} from '../servicios/servicioPartidos';
import type { CursorPartidos } from '../servicios/servicioPartidos';
import type { DatosPartido, Partido, Promedios } from '../tipos/partido';
import { obtenerMensajeError } from '../utilidades/errores';
import { calcularPromedios } from '../utilidades/promedios';

// Store de partidos: F05 lo creó con las 3 acciones del modal; F06 le agrega la lista.
// Las acciones de F05 devuelven el mensaje de error, o null si salió bien (excepción de
// coding-standards §8): el error de guardar solo lo muestra el modal. Si quedara en
// mensajeError, el Historial mostraría VistaError detrás del modal.
type EstadoPartidos = {
  partidos: Partido[]; // lo que muestra el Historial: las páginas cargadas o la caché
  promedios: Promedios | null; // null = todavía no se carga
  cursor: CursorPartidos | null; // dónde sigue la siguiente página (lo usa el servicio)
  hayMas: boolean;
  cargando: boolean; // primera carga → VistaCargando
  cargandoMas: boolean; // siguiente página → indicador en el pie
  mensajeError: string | null; // falla la primera carga → VistaError
  mensajeErrorMas: string | null; // falla "cargar más" → mensaje en el pie; la lista se queda
  guardadoEn: string | null; // distinto de null = se está mostrando la caché
  cargarHistorial: (idUsuario: string) => Promise<void>;
  cargarMas: (idUsuario: string) => Promise<void>;
  registrarPartido: (idUsuario: string, datos: DatosPartido) => Promise<string | null>;
  actualizarPartido: (
    idUsuario: string,
    idPartido: string,
    datos: DatosPartido,
  ) => Promise<string | null>;
  borrarPartido: (idUsuario: string, idPartido: string) => Promise<string | null>;
  limpiar: () => void;
};

// Los nombres de las acciones no repiten los del servicio para no chocar en los imports
export const useStorePartidos = create<EstadoPartidos>((set, get) => ({
  partidos: [],
  promedios: null,
  cursor: null,
  hayMas: false,
  cargando: false,
  cargandoMas: false,
  mensajeError: null,
  mensajeErrorMas: null,
  guardadoEn: null,

  // Primera página + todos los partidos (para promedios y caché). Sin internet: la caché (RN11)
  cargarHistorial: async (idUsuario) => {
    if (get().cargando) {
      return; // ya hay una carga en curso
    }
    set({ cargando: true, mensajeError: null, mensajeErrorMas: null });
    try {
      // Diferencia con la clase: allá la pantalla usa useNetInfo. Aquí decide el store,
      // así "¿uso la caché?" se resuelve en un solo lugar (F06)
      const conectado = await hayConexion();
      if (!conectado) {
        const cache = await leerCacheHistorial(idUsuario);
        if (cache === null) {
          set({ mensajeError: 'Sin conexión y sin datos guardados' }); // E3 de 02-data-model
        } else {
          // La caché se muestra completa, sin paginar
          set({
            partidos: cache.partidos,
            promedios: calcularPromedios(cache.partidos),
            hayMas: false,
            cursor: null,
            guardadoEn: cache.guardadoEn,
          });
        }
      } else {
        const pagina = await obtenerPaginaPartidos(idUsuario, null);
        const todos = await obtenerTodosLosPartidos(idUsuario);
        // Si falla guardar la caché, la lista se muestra igual (E5 de F06)
        try {
          await guardarCacheHistorial(idUsuario, todos);
        } catch (error) {
          console.error('cargarHistorial (guardar caché):', error);
        }
        set({
          partidos: pagina.partidos,
          cursor: pagina.cursor,
          hayMas: pagina.hayMas,
          promedios: calcularPromedios(todos),
          guardadoEn: null,
        });
      }
    } catch (error) {
      console.error('cargarHistorial:', error);
      set({ mensajeError: obtenerMensajeError(error) });
    } finally {
      set({ cargando: false });
    }
  },

  // Siguiente página para el infinite scroll (clase FlatList Avanzado)
  cargarMas: async (idUsuario) => {
    const { cargando, cargandoMas, hayMas, cursor } = get();
    // Guarda de la clase: onEndReached puede dispararse dos veces seguidas (E8 de F06)
    if (cargando || cargandoMas || !hayMas || cursor === null) {
      return;
    }
    set({ cargandoMas: true, mensajeErrorMas: null });
    try {
      const pagina = await obtenerPaginaPartidos(idUsuario, cursor);
      // Se agregan al final; lo que ya estaba no se toca
      set({
        partidos: [...get().partidos, ...pagina.partidos],
        cursor: pagina.cursor,
        hayMas: pagina.hayMas,
      });
    } catch (error) {
      console.error('cargarMas:', error);
      set({ mensajeErrorMas: obtenerMensajeError(error) }); // la lista se queda
    } finally {
      set({ cargandoMas: false });
    }
  },

  // Las 3 acciones de F05: si salen bien, esperan la recarga (página 1 + todos) antes de
  // devolver null, así el modal se cierra con la lista y los promedios ya al día (F06.3).
  // cargarHistorial no lanza errores: si la recarga falla, igual se guardó (E10 de F06)
  registrarPartido: async (idUsuario, datos) => {
    try {
      await crearPartido(idUsuario, datos);
      await get().cargarHistorial(idUsuario);
      return null;
    } catch (error) {
      console.error('registrarPartido:', error);
      return obtenerMensajeError(error);
    }
  },

  actualizarPartido: async (idUsuario, idPartido, datos) => {
    try {
      await editarPartido(idUsuario, idPartido, datos);
      await get().cargarHistorial(idUsuario);
      return null;
    } catch (error) {
      console.error('actualizarPartido:', error);
      return obtenerMensajeError(error);
    }
  },

  borrarPartido: async (idUsuario, idPartido) => {
    try {
      await eliminarPartido(idUsuario, idPartido);
      await get().cargarHistorial(idUsuario);
      return null;
    } catch (error) {
      console.error('borrarPartido:', error);
      return obtenerMensajeError(error);
    }
  },

  // Deja todo como al inicio. Lo llama cerrarSesion (F01.18)
  limpiar: () =>
    set({
      partidos: [],
      promedios: null,
      cursor: null,
      hayMas: false,
      cargando: false,
      cargandoMas: false,
      mensajeError: null,
      mensajeErrorMas: null,
      guardadoEn: null,
    }),
}));
