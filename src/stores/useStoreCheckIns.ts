import { create } from 'zustand';

import { CHECK_IN_DISTANCIA_MAXIMA_METROS } from '../constantes/configuracion';
import { crearCheckIn, obtenerCheckInsActivos, terminarCheckIn } from '../servicios/servicioCheckIns';
import { verificarConexion } from '../servicios/servicioConexion';
import {
  obtenerUbicacionActual,
  pedirPermisoUbicacion,
  ubicacionNegada,
} from '../servicios/servicioUbicacion';
import type { Cancha } from '../tipos/cancha';
import type { ResumenAfluencia } from '../tipos/checkIn';
import { calcularDistanciaMetros, estaDentroDelRadio } from '../utilidades/distancia';
import { obtenerMensajeError } from '../utilidades/errores';

// Store de check-ins (F02), ampliado por F03 con hacer y terminar check-in.
// Solo guarda ResumenAfluencia: números por cancha y mi check-in, nunca uids ajenos (RN06).
// Hacer y terminar devuelven el mensaje (null = salió bien), igual que F01 y F05:
// solo lo muestra el panel. mensajeError sigue siendo solo del conteo (F02).
type EstadoCheckIns = {
  resumen: ResumenAfluencia | null; // null = no hay conteo confiable
  cargando: boolean;
  mensajeError: string | null;
  permisoUbicacionNegado: boolean; // es del teléfono, no de una pantalla
  cargarResumen: (idUsuario: string) => Promise<void>;
  revisarPermisoUbicacion: () => Promise<void>;
  hacerCheckIn: (idUsuario: string, cancha: Cancha) => Promise<string | null>;
  terminarMiCheckIn: (idUsuario: string) => Promise<string | null>;
  limpiar: () => void;
};

export const useStoreCheckIns = create<EstadoCheckIns>((set, get) => ({
  resumen: null,
  cargando: false,
  mensajeError: null,
  permisoUbicacionNegado: false,

  cargarResumen: async (idUsuario) => {
    // Guarda contra el doble toque en "Actualizar": una sola petición a la vez
    if (get().cargando) {
      return;
    }
    set({ cargando: true, mensajeError: null });
    try {
      const resumen = await obtenerCheckInsActivos(idUsuario);
      set({ resumen });
    } catch (error) {
      console.error('cargarResumen:', error);
      // resumen: null para no mostrar conteos viejos como si fueran de ahora
      set({ mensajeError: obtenerMensajeError(error), resumen: null });
    } finally {
      set({ cargando: false });
    }
  },

  // Revisa sin mostrar el diálogo de iOS. Si falla se deja intentar (false)
  revisarPermisoUbicacion: async () => {
    try {
      set({ permisoUbicacionNegado: await ubicacionNegada() });
    } catch (error) {
      console.error('revisarPermisoUbicacion:', error);
      set({ permisoUbicacionNegado: false });
    }
  },

  hacerCheckIn: async (idUsuario, cancha) => {
    try {
      // Sin internet falla antes de usar el GPS (CAD13)
      await verificarConexion();
      const permitido = await pedirPermisoUbicacion();
      set({ permisoUbicacionNegado: !permitido });
      if (!permitido) {
        return 'Activa la ubicación para hacer check-in.';
      }
      // La ubicación vive solo en esta variable: no va al store, a Firestore ni a la consola (RN06)
      const ubicacion = await obtenerUbicacionActual();
      const distancia = calcularDistanciaMetros(ubicacion, cancha);
      // RN02: lejos no se llama a Firebase (las reglas no pueden revisarlo)
      if (!estaDentroDelRadio(distancia)) {
        return `Estás a ${Math.round(distancia)} m de la cancha. Acércate a ${CHECK_IN_DISTANCIA_MAXIMA_METROS} m o menos para hacer check-in.`;
      }
      await crearCheckIn(idUsuario, cancha.idCancha);
      // El mapa y el panel se actualizan con el conteo nuevo (operación 1 de 02-data-model)
      await get().cargarResumen(idUsuario);
      return null;
    } catch (error) {
      console.error('hacerCheckIn:', error);
      return obtenerMensajeError(error);
    }
  },

  // "Ya me voy" (RN04)
  terminarMiCheckIn: async (idUsuario) => {
    try {
      await terminarCheckIn(idUsuario);
      await get().cargarResumen(idUsuario);
      return null;
    } catch (error) {
      console.error('terminarMiCheckIn:', error);
      return obtenerMensajeError(error);
    }
  },

  // Lo llama cerrarSesion (F01.18, en el bloque de F03)
  limpiar: () =>
    set({ resumen: null, cargando: false, mensajeError: null, permisoUbicacionNegado: false }),
}));
