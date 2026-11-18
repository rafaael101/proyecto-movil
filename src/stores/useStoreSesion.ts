import { create } from 'zustand';

import {
  crearCuenta,
  entrarConCorreo,
  escucharCambiosDeSesion,
  salirDeFirebase,
} from '../servicios/servicioSesion';
import type { Usuario, ValoresInicioSesion, ValoresRegistro } from '../tipos/usuario';
import { obtenerMensajeError } from '../utilidades/errores';

// Sin cargando ni mensajeError (excepción de coding-standards §8): revisandoSesion
// hace de "cargando" y cada acción devuelve el mensaje para que lo guarde la
// pantalla que hizo la petición.
type EstadoSesion = {
  usuario: Usuario | null;
  revisandoSesion: boolean; // true al abrir la app hasta la primera respuesta de Firebase (hace de "cargando")
  cerrandoSesion: boolean; // deshabilita el botón de Perfil
  escucharSesion: () => () => void; // devuelve la función para dejar de escuchar
  registrarse: (valores: ValoresRegistro) => Promise<string | null>; // null = salió bien; texto = mensaje de error
  iniciarSesion: (valores: ValoresInicioSesion) => Promise<string | null>;
  cerrarSesion: () => Promise<string | null>;
  limpiar: () => void;
};

export const useStoreSesion = create<EstadoSesion>((set, get) => ({
  usuario: null,
  revisandoSesion: true,
  cerrandoSesion: false,

  escucharSesion: () => {
    // Cada aviso de Firebase (usuario o null) termina la revisión inicial
    return escucharCambiosDeSesion((usuario) => {
      set({ usuario, revisandoSesion: false });
    });
  },

  registrarse: async (valores) => {
    try {
      const usuario = await crearCuenta(
        valores.nombre.trim(),
        valores.correo.trim(),
        valores.contrasena,
      );
      // Firebase avisa del usuario antes de guardar el nombre (E15):
      // aquí se guarda el que ya trae el nombre
      set({ usuario });
      return null;
    } catch (error) {
      console.error('registrarse:', error);
      return obtenerMensajeError(error);
    }
  },

  iniciarSesion: async (valores) => {
    try {
      // No hace set: el usuario llega por escucharSesion
      await entrarConCorreo(valores.correo.trim(), valores.contrasena);
      return null;
    } catch (error) {
      console.error('iniciarSesion:', error);
      return obtenerMensajeError(error);
    }
  },

  // Por ahora solo signOut y limpiar() de este store. Terminar el check-in (F01.16),
  // borrar la caché (F01.17) y limpiar los otros stores (F01.18) llegan después.
  cerrarSesion: async () => {
    set({ cerrandoSesion: true });
    try {
      await salirDeFirebase();
    } catch (error) {
      // Si signOut falla no se limpia nada: sigue la sesión (E15 de F01)
      console.error('cerrarSesion:', error);
      set({ cerrandoSesion: false });
      return obtenerMensajeError(error);
    }
    get().limpiar();
    return null;
  },

  // revisandoSesion queda en false: la escucha sigue activa y Firebase ya avisó
  // que no hay usuario; si volviera a true, la app se quedaría cargando para siempre
  limpiar: () => set({ usuario: null, revisandoSesion: false, cerrandoSesion: false }),
}));
