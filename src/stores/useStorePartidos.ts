import { create } from 'zustand';

import { crearPartido, editarPartido, eliminarPartido } from '../servicios/servicioPartidos';
import type { DatosPartido, Partido } from '../tipos/partido';
import { obtenerMensajeError } from '../utilidades/errores';

// Store mínimo de F05: F06 le agrega cargando, mensajeError, la carga paginada y la caché.
// Las acciones devuelven el mensaje de error, o null si salió bien (excepción de
// coding-standards §8): el error de guardar solo lo muestra el modal. Si quedara en
// un mensajeError del store, el Historial mostraría VistaError detrás del modal.
type EstadoPartidos = {
  partidos: Partido[]; // la llena F06; F05 solo la lee para editar
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
export const useStorePartidos = create<EstadoPartidos>((set) => ({
  partidos: [],

  registrarPartido: async (idUsuario, datos) => {
    try {
      await crearPartido(idUsuario, datos);
      return null;
    } catch (error) {
      console.error('registrarPartido:', error);
      return obtenerMensajeError(error);
    }
  },

  actualizarPartido: async (idUsuario, idPartido, datos) => {
    try {
      await editarPartido(idUsuario, idPartido, datos);
      return null;
    } catch (error) {
      console.error('actualizarPartido:', error);
      return obtenerMensajeError(error);
    }
  },

  borrarPartido: async (idUsuario, idPartido) => {
    try {
      await eliminarPartido(idUsuario, idPartido);
      return null;
    } catch (error) {
      console.error('borrarPartido:', error);
      return obtenerMensajeError(error);
    }
  },

  limpiar: () => set({ partidos: [] }),
}));
