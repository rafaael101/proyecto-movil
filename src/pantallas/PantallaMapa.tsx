import type { FC } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colores, espaciado, radio, tipografia } from '../constantes/tema';
import type { PropsPantallaMapa } from '../navegacion/tipos';

// PROVISIONAL (N4): el contenido real lo ponen F02 y F03
export const PantallaMapa: FC<PropsPantallaMapa> = ({ navigation }) => {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.texto}>PantallaMapa</Text>
      {/* PROVISIONAL (N7): se quita cuando F02 ponga los marcadores.
          navigate y no push: un doble toque abre un solo detalle (E10) */}
      <TouchableOpacity
        style={estilos.boton}
        onPress={() => navigation.navigate('DetalleCancha', { idCancha: 'sullivan' })}
      >
        <Text style={estilos.textoBoton}>Ver Sullivan</Text>
      </TouchableOpacity>
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
  boton: {
    backgroundColor: colores.primario,
    borderRadius: radio,
    paddingVertical: espaciado.sm,
    paddingHorizontal: espaciado.lg,
    marginTop: espaciado.md,
  },
  textoBoton: {
    ...tipografia.cuerpo,
    color: colores.textoSobrePrimario,
  },
});
