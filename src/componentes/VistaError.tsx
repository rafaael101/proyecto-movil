import type { FC } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colores, espaciado, radio, tipografia } from '../constantes/tema';

type PropsVistaError = {
  mensaje: string;
  textoBoton?: string;
  alPresionarBoton?: () => void;
};

// Pantalla de error compartida: mismo aspecto en toda la app
export const VistaError: FC<PropsVistaError> = ({
  mensaje,
  textoBoton = 'Reintentar',
  alPresionarBoton,
}) => {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.mensaje}>{mensaje}</Text>
      {alPresionarBoton !== undefined && (
        <TouchableOpacity style={estilos.boton} onPress={alPresionarBoton}>
          <Text style={estilos.textoBoton}>{textoBoton}</Text>
        </TouchableOpacity>
      )}
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
    color: colores.texto,
    textAlign: 'center',
    marginBottom: espaciado.md,
  },
  boton: {
    backgroundColor: colores.primario,
    borderRadius: radio,
    paddingVertical: espaciado.sm,
    paddingHorizontal: espaciado.lg,
  },
  textoBoton: {
    ...tipografia.cuerpo,
    color: colores.textoSobrePrimario,
  },
});
