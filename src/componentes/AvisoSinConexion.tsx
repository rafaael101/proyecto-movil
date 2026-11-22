import type { FC } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colores, espaciado, radio, tipografia } from '../constantes/tema';
import { formatearFechaHora } from '../utilidades/fechas';

type PropsAvisoSinConexion = {
  guardadoEn: string; // ISO de la caché
  alReintentar: () => void; // → cargarHistorial
};

// Aviso de que se está viendo la caché (RN11). Lo usan Historial y Perfil (F06)
export const AvisoSinConexion: FC<PropsAvisoSinConexion> = ({ guardadoEn, alReintentar }) => {
  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.mensaje}>
        Sin conexión — datos guardados el {formatearFechaHora(guardadoEn)}
      </Text>
      <TouchableOpacity onPress={alReintentar}>
        <Text style={estilos.textoBoton}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );
};

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio,
    padding: espaciado.md,
    marginBottom: espaciado.sm,
  },
  mensaje: {
    ...tipografia.pequeno,
    color: colores.textoSecundario,
  },
  textoBoton: {
    ...tipografia.pequeno,
    color: colores.primario,
    marginTop: espaciado.xs,
  },
});
