import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { VistaCargando } from '../componentes/VistaCargando';
import { colores, espaciado, tipografia } from '../constantes/tema';
import type { PropsPantallaPerfil } from '../navegacion/tipos';
import { useStoreSesion } from '../stores/useStoreSesion';
import { obtenerNombreVisible } from '../utilidades/usuario';

// Pantalla "Mi perfil": la parte de F01 (nombre y correo). F06 agrega los promedios.
export const PantallaPerfil: FC<PropsPantallaPerfil> = () => {
  const usuario = useStoreSesion((estado) => estado.usuario);

  // Solo pasa un instante al cerrar sesión, antes de que desaparezca la pantalla (F01)
  if (usuario === null) {
    return <VistaCargando />;
  }

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.nombre}>{obtenerNombreVisible(usuario.nombre)}</Text>
      <Text style={estilos.correo}>{usuario.correo}</Text>
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
});
