import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import type { HostInstance } from 'react-native';

import {
  abrirCamara,
  abrirGaleria,
  camaraNegada,
  compartirImagenDeVista,
  pedirPermisoCamara,
} from '../servicios/servicioTarjeta';
import { obtenerMensajeError } from '../utilidades/errores';

type EstadoTarjeta = {
  uriFoto: string | null; // null = sin foto
  permisoCamaraNegado: boolean;
  trabajando: boolean; // cámara, galería o compartir abiertos: nada se puede tocar
  mensaje: string | null; // error debajo de "Compartir"
  tomarFoto: () => Promise<void>;
  elegirFoto: () => Promise<void>;
  // HostInstance y no View: ver compartirImagenDeVista (react-native 0.88)
  compartirTarjeta: (vista: RefObject<HostInstance | null>) => Promise<void>;
};

// Estado de la tarjeta de jugador (F07). Sin store: la foto la usa una sola pantalla y
// debe perderse al cerrar el modal (§8, 02-data-model). Por eso este hook sí llama al
// servicio y hace el try/catch que en otras features hace el store (§4, §10).
// uriFoto solo vive aquí, en memoria: no va a un store, a Firestore, a AsyncStorage
// ni a la consola.
export function useTarjetaJugador(): EstadoTarjeta {
  const [uriFoto, setUriFoto] = useState<string | null>(null);
  const [permisoCamaraNegado, setPermisoCamaraNegado] = useState(false);
  const [trabajando, setTrabajando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  // Al abrir la tarjeta se revisa el permiso sin mostrar el diálogo.
  // useEffect no puede ser async: se arma una función async adentro y se llama
  useEffect(() => {
    const revisarPermiso = async () => {
      try {
        setPermisoCamaraNegado(await camaraNegada());
      } catch (error) {
        // Se queda en false: se deja intentar
        console.error('revisarPermisoCamara:', error);
      }
    };
    revisarPermiso();
  }, []);

  const tomarFoto = async () => {
    setMensaje(null);
    setTrabajando(true);
    try {
      const permitido = await pedirPermisoCamara();
      setPermisoCamaraNegado(!permitido);
      // Negado: sin mensaje, ya se ve la explicación del permiso
      if (permitido) {
        const uri = await abrirCamara();
        // null = canceló: no cambia nada y, si había foto, se queda
        if (uri !== null) {
          setUriFoto(uri);
        }
      }
    } catch (error) {
      console.error('tomarFoto:', error);
      setMensaje(obtenerMensajeError(error));
    } finally {
      setTrabajando(false);
    }
  };

  const elegirFoto = async () => {
    setMensaje(null);
    setTrabajando(true);
    try {
      const uri = await abrirGaleria();
      if (uri !== null) {
        setUriFoto(uri);
      }
    } catch (error) {
      console.error('elegirFoto:', error);
      setMensaje(obtenerMensajeError(error));
    } finally {
      setTrabajando(false);
    }
  };

  const compartirTarjeta = async (vista: RefObject<HostInstance | null>) => {
    setMensaje(null);
    setTrabajando(true);
    try {
      await compartirImagenDeVista(vista);
    } catch (error) {
      console.error('compartirTarjeta:', error);
      setMensaje(obtenerMensajeError(error));
    } finally {
      setTrabajando(false);
    }
  };

  return {
    uriFoto,
    permisoCamaraNegado,
    trabajando,
    mensaje,
    tomarFoto,
    elegirFoto,
    compartirTarjeta,
  };
}
