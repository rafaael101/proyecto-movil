import type { FC } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colores, espaciado, radio, tipografia } from '../constantes/tema';

type PropsAvisoMapa = {
  mensaje: string;
  textoBoton?: string; // por defecto "Reintentar"
  alPresionarBoton?: () => void; // sin esto, no hay botón
};

// Tarjeta de aviso que flota arriba del mapa (F02): sin conexión, error o nadie jugando.
// No reemplaza al mapa: las canchas se siguen viendo debajo (§9).
export const AvisoMapa: FC<PropsAvisoMapa> = ({
  mensaje,
  textoBoton = 'Reintentar',
  alPresionarBoton,
}) => {
  return (
    <View style={estilos.tarjeta}>
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
  // position: 'absolute' la pone encima del mapa, con margen a los lados y arriba
  tarjeta: {
    position: 'absolute',
    top: espaciado.md,
    left: espaciado.md,
    right: espaciado.md,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio,
    padding: espaciado.md,
  },
  mensaje: {
    ...tipografia.cuerpo,
    color: colores.texto,
  },
  boton: {
    marginTop: espaciado.sm,
    alignSelf: 'flex-start',
  },
  textoBoton: {
    ...tipografia.cuerpo,
    color: colores.primario,
  },
});
