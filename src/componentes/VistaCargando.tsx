import type { FC } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colores } from '../constantes/tema';

// Vista de carga compartida: al revisar la sesión (01-navigation) y en el
// estado "cargando" de las pantallas (§9), para que siempre se vea igual
export const VistaCargando: FC = () => {
  return (
    <View style={estilos.contenedor}>
      <ActivityIndicator size="large" color={colores.primario} />
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
});
