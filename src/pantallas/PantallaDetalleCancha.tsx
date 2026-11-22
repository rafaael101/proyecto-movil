import { useEffect, useLayoutEffect, useState } from 'react';
import type { FC } from 'react';
import { Linking, ScrollView, StyleSheet } from 'react-native';

import { PanelCheckIn } from '../componentes/PanelCheckIn';
import { VistaCargando } from '../componentes/VistaCargando';
import { VistaError } from '../componentes/VistaError';
import { colores, espaciado } from '../constantes/tema';
import type { PropsPantallaDetalleCancha } from '../navegacion/tipos';
import { useStoreCheckIns } from '../stores/useStoreCheckIns';
import { useStoreSesion } from '../stores/useStoreSesion';
import { buscarCancha } from '../utilidades/canchas';

// Detalle de una cancha: por ahora solo el check-in (F03). F04 agrega arriba del
// panel el nombre y la afluencia.
export const PantallaDetalleCancha: FC<PropsPantallaDetalleCancha> = ({ navigation, route }) => {
  // Hooks arriba, antes de cualquier return (§6)
  const usuario = useStoreSesion((estado) => estado.usuario);
  const resumen = useStoreCheckIns((estado) => estado.resumen);
  const permisoNegado = useStoreCheckIns((estado) => estado.permisoUbicacionNegado);
  const revisarPermisoUbicacion = useStoreCheckIns((estado) => estado.revisarPermisoUbicacion);
  const hacerCheckIn = useStoreCheckIns((estado) => estado.hacerCheckIn);
  const terminarMiCheckIn = useStoreCheckIns((estado) => estado.terminarMiCheckIn);
  // Solo los usa esta pantalla: useState y no el store (§8), como el error del servidor de F05
  const [trabajando, setTrabajando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  // undefined si el id no está en el catálogo (RN05, E1 de 01-navigation)
  const cancha = buscarCancha(route.params.idCancha);

  // Nombre de la cancha en el header (01-navigation, Títulos). Va antes de los return
  // tempranos (regla de los hooks); en E1 queda "Cancha"
  useLayoutEffect(() => {
    navigation.setOptions({ title: cancha?.nombre ?? 'Cancha' });
  }, [navigation, cancha]);

  // Se revisa el permiso sin mostrar el diálogo: el diálogo sale al tocar "Hacer check-in"
  useEffect(() => {
    revisarPermisoUbicacion();
  }, [revisarPermisoUbicacion]);

  // Pasa un instante al cerrar sesión con el detalle abierto
  if (usuario === null) {
    return <VistaCargando />;
  }

  // El id no está en el catálogo (E1 de 01-navigation)
  if (cancha === undefined) {
    return (
      <VistaError
        mensaje="No encontramos esta cancha"
        textoBoton="Volver al mapa"
        alPresionarBoton={() => navigation.goBack()}
      />
    );
  }

  const alHacerCheckIn = async () => {
    setMensaje(null);
    setTrabajando(true);
    setMensaje(await hacerCheckIn(usuario.idUsuario, cancha));
    setTrabajando(false);
  };

  const alTerminar = async () => {
    setMensaje(null);
    setTrabajando(true);
    setMensaje(await terminarMiCheckIn(usuario.idUsuario));
    setTrabajando(false);
  };

  return (
    <ScrollView style={estilos.contenedor} contentContainerStyle={estilos.contenido}>
      <PanelCheckIn
        cancha={cancha}
        // Sin conteo (por ejemplo, sin internet) no se sabe si tengo check-in (E1 de F03)
        miCheckIn={resumen?.miCheckIn ?? null}
        permisoNegado={permisoNegado}
        trabajando={trabajando}
        mensaje={mensaje}
        alHacerCheckIn={alHacerCheckIn}
        alTerminar={alTerminar}
        // Abre los ajustes de Expo Go, donde se activa la ubicación
        alAbrirAjustes={() => Linking.openSettings()}
      />
    </ScrollView>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: espaciado.md,
  },
});
