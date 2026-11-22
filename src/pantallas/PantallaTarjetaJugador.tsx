import { useRef } from 'react';
import type { FC } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import type { HostInstance } from 'react-native';

import { AccionesTarjeta } from '../componentes/AccionesTarjeta';
import { TarjetaJugador } from '../componentes/TarjetaJugador';
import { VistaCargando } from '../componentes/VistaCargando';
import { VistaError } from '../componentes/VistaError';
import { colores, espaciado } from '../constantes/tema';
import { useTarjetaJugador } from '../hooks/useTarjetaJugador';
import type { PropsPantallaTarjetaJugador } from '../navegacion/tipos';
import { useStorePartidos } from '../stores/useStorePartidos';
import { useStoreSesion } from '../stores/useStoreSesion';
import { obtenerNombreVisible } from '../utilidades/usuario';

// Modal "Tarjeta de jugador" (F07): la tarjeta de un partido con foto, para compartirla.
// El partido sale de la lista del Historial (o su caché): no usa la red (E7).
export const PantallaTarjetaJugador: FC<PropsPantallaTarjetaJugador> = ({
  navigation,
  route,
}) => {
  // Hooks arriba, antes de cualquier return (§6)
  const usuario = useStoreSesion((estado) => estado.usuario);
  const partidos = useStorePartidos((estado) => estado.partidos);
  // useRef guarda la vista de la tarjeta para convertirla en imagen.
  // HostInstance y no View: ver compartirImagenDeVista (react-native 0.88)
  const vistaTarjeta = useRef<HostInstance>(null);
  const {
    uriFoto,
    permisoCamaraNegado,
    trabajando,
    mensaje,
    tomarFoto,
    elegirFoto,
    compartirTarjeta,
  } = useTarjetaJugador();

  // Pasa un instante si la sesión termina con el modal abierto (E5 de 01-navigation)
  if (usuario === null) {
    return <VistaCargando />;
  }

  // Solo se busca en la lista del usuario (RN10). Si no está: ajeno, borrado o fuera de
  // la lista (E3 de 01-navigation, mismo código que F05)
  const partido = partidos.find(
    (partidoLista) => partidoLista.idPartido === route.params.idPartido,
  );
  if (partido === undefined) {
    return (
      <VistaError
        mensaje="Este partido ya no existe"
        textoBoton="Cerrar"
        alPresionarBoton={() => navigation.goBack()}
      />
    );
  }

  return (
    <ScrollView style={estilos.contenedor} contentContainerStyle={estilos.contenido}>
      {/* Solo este View se convierte en imagen, sin los botones. collapsable={false}:
          sin él, React Native puede quitar un View sin estilos al dibujar y captureRef
          no lo encontraría */}
      <View ref={vistaTarjeta} collapsable={false}>
        <TarjetaJugador
          nombre={obtenerNombreVisible(usuario.nombre)}
          partido={partido}
          uriFoto={uriFoto}
        />
      </View>
      <AccionesTarjeta
        permisoCamaraNegado={permisoCamaraNegado}
        trabajando={trabajando}
        mensaje={mensaje}
        alTomarFoto={tomarFoto}
        alElegirFoto={elegirFoto}
        alCompartir={() => compartirTarjeta(vistaTarjeta)}
        // Abre los ajustes de Expo Go, donde se activa la cámara (como F03)
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
  // gap: el espacio md entre la tarjeta y los botones
  contenido: {
    padding: espaciado.md,
    gap: espaciado.md,
  },
});
