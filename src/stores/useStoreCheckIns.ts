import { create } from 'zustand';

import { obtenerCheckInsActivos } from '../servicios/servicioCheckIns';
import type { ResumenAfluencia } from '../tipos/checkIn';
import { obtenerMensajeError } from '../utilidades/errores';

// Store de check-ins (F02). F03 le agrega hacer y terminar check-in.
// Solo guarda ResumenAfluencia: números por cancha y mi check-in, nunca uids ajenos (RN06).
type EstadoCheckIns = {
  resumen: ResumenAfluencia | null; // null = no hay conteo confiable
  cargando: boolean;
  mensajeError: string | null;
  cargarResumen: (idUsuario: string) => Promise<void>;
  limpiar: () => void;
};

export const useStoreCheckIns = create<EstadoCheckIns>((set, get) => ({
  resumen: null,
  cargando: false,
  mensajeError: null,

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

  // Lo llama cerrarSesion (F01.18, en el bloque de F03)
  limpiar: () => set({ resumen: null, cargando: false, mensajeError: null }),
}));
