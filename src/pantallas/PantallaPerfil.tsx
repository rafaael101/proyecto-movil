import type { FC } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { BotonPrincipal } from '../componentes/BotonPrincipal';
import { VistaCargando } from '../componentes/VistaCargando';
import { colores, espaciado, tipografia } from '../constantes/tema';
import type { PropsPantallaPerfil } from '../navegacion/tipos';
import { useStoreSesion } from '../stores/useStoreSesion';
import { obtenerNombreVisible } from '../utilidades/usuario';

// Pantalla "Mi perfil": la parte de F01 (nombre, correo y cerrar sesión).
// F06 agrega los promedios entre el correo y el botón.
export const PantallaPerfil: FC<PropsPantallaPerfil> = () => {
  const usuario = useStoreSesion((estado) => estado.usuario);
  const cerrandoSesion = useStoreSesion((estado) => estado.cerrandoSesion);
  const cerrarSesion = useStoreSesion((estado) => estado.cerrarSesion);

  // Pide confirmación antes de cerrar sesión (01-navigation, Al cerrar sesión).
  // Sin navigate: al quedar el store sin usuario, aparece "Iniciar sesión" solo.
  const manejarCerrarSesion = () => {
    Alert.alert('¿Seguro que quieres cerrar sesión?', undefined, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive', // en rojo en iPhone
        onPress: async () => {
          const mensaje = await cerrarSesion();
          // Si signOut falla, sigue en Perfil con sesión y se avisa (E15)
          if (mensaje !== null) {
            Alert.alert(mensaje);
          }
        },
      },
    ]);
  };

  // Solo pasa un instante al cerrar sesión, antes de que desaparezca la pantalla (F01)
  if (usuario === null) {
    return <VistaCargando />;
  }

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.nombre}>{obtenerNombreVisible(usuario.nombre)}</Text>
      <Text style={estilos.correo}>{usuario.correo}</Text>
      <View style={estilos.contenedorBoton}>
        {/* Deshabilitado con indicador mientras cierra: evita el doble toque (E16) */}
        <BotonPrincipal
          texto="Cerrar sesión"
          alPresionar={manejarCerrarSesion}
          cargando={cerrandoSesion}
        />
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    padding: espaciado.lg,
    backgroundColor: colores.fondo,
  },
  nombre: {
    ...tipografia.subtitulo,
    color: colores.texto,
  },
  correo: {
    ...tipografia.cuerpo,
    color: colores.textoSecundario,
    marginTop: espaciado.xs,
  },
  contenedorBoton: {
    marginTop: espaciado.xl,
  },
});
