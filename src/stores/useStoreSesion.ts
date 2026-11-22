import { create } from 'zustand';

import { borrarCacheHistorial } from '../servicios/servicioCache';
import { terminarCheckIn } from '../servicios/servicioCheckIns';
import {
  crearCuenta,
  entrarConCorreo,
  escucharCambiosDeSesion,
  salirDeFirebase,
} from '../servicios/servicioSesion';
import type { Usuario, ValoresInicioSesion, ValoresRegistro } from '../tipos/usuario';
import { obtenerMensajeError } from '../utilidades/errores';
import { useStoreCheckIns } from './useStoreCheckIns';
import { useStorePartidos } from './useStorePartidos';

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

  // Terminar el check-in (F01.16), signOut, borrar la caché (F01.17), limpiar los stores
  // de check-ins y de partidos (F01.18) y al final este store.
  cerrarSesion: async () => {
    set({ cerrandoSesion: true });
    // RN04: se llama siempre, sin revisar si hay uno activo (borrar uno que no existe no
    // da error). Va antes de signOut porque las reglas de Firestore necesitan la sesión.
    // Si falla (por ejemplo, sin internet) se sigue: el check-in vence solo (RN01)
    const usuario = get().usuario;
    if (usuario !== null) {
      try {
        await terminarCheckIn(usuario.idUsuario);
      } catch (error) {
        console.error('cerrarSesion (terminar check-in):', error);
      }
    }
    try {
      await salirDeFirebase();
    } catch (error) {
      // Si signOut falla no se limpia nada: sigue la sesión (E15 de F01)
      console.error('cerrarSesion:', error);
      set({ cerrandoSesion: false });
      return obtenerMensajeError(error);
    }
    // Cerrar sesión de verdad (RN11): sin caché, el siguiente usuario no ve estos partidos.
    // Si falla se sigue: la caché guarda idUsuario y no se le mostraría a otro (E5)
    try {
      await borrarCacheHistorial();
    } catch (error) {
      console.error('cerrarSesion (borrar caché):', error);
    }
    // Excepción 4 de §4: solo cerrarSesion limpia otros stores, con getState() (fuera de React)
    useStoreCheckIns.getState().limpiar();
    useStorePartidos.getState().limpiar();
    get().limpiar();
    return null;
  },

  // revisandoSesion queda en false: la escucha sigue activa y Firebase ya avisó
  // que no hay usuario; si volviera a true, la app se quedaría cargando para siempre
  limpiar: () => set({ usuario: null, revisandoSesion: false, cerrandoSesion: false }),
}));
