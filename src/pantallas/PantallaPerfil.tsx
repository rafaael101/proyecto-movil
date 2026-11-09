import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colores, tipografia } from '../constantes/tema';
import type { PropsPantallaPerfil } from '../navegacion/tipos';

// PROVISIONAL (N4): el contenido real lo ponen F01 y F06
export const PantallaPerfil: FC<PropsPantallaPerfil> = () => {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.texto}>PantallaPerfil</Text>
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colores.fondo,
  },
  texto: {
    ...tipografia.cuerpo,
    color: colores.texto,
  },
});
