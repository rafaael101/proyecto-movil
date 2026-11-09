import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colores, tipografia } from '../constantes/tema';
import type { PropsPantallaDetalleCancha } from '../navegacion/tipos';

// PROVISIONAL (N4): el contenido real lo pone F04
export const PantallaDetalleCancha: FC<PropsPantallaDetalleCancha> = () => {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.texto}>PantallaDetalleCancha</Text>
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
