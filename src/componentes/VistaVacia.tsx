import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, tipografia } from '../constantes/tema';

type PropsVistaVacia = {
  mensaje: string;
};

// Estado "vacío" compartido (§9): mismo aspecto en toda la app
export const VistaVacia: FC<PropsVistaVacia> = ({ mensaje }) => {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.mensaje}>{mensaje}</Text>
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: espaciado.lg,
    backgroundColor: colores.fondo,
  },
  mensaje: {
    ...tipografia.cuerpo,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
});
