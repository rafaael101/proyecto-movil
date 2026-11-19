import type { FC } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { colores, espaciado, radio, tipografia } from '../constantes/tema';

type PropsBotonPrincipal = {
  texto: string;
  alPresionar: () => void;
  deshabilitado?: boolean;
  cargando?: boolean; // muestra ActivityIndicator en lugar del texto y deshabilita el botón
};

// Botón principal compartido (F01, F05): guardar, iniciar sesión, cerrar sesión...
export const BotonPrincipal: FC<PropsBotonPrincipal> = ({
  texto,
  alPresionar,
  deshabilitado = false,
  cargando = false,
}) => {
  // Mientras carga tampoco se puede tocar: evita enviar dos veces (02-data-model E10)
  const inactivo = deshabilitado || cargando;

  return (
    <TouchableOpacity
      // accessibilityRole="button": el test lo encuentra como botón aunque el header
      // tenga el mismo texto (F01)
      accessibilityRole="button"
      style={[estilos.boton, inactivo && estilos.botonInactivo]}
      onPress={alPresionar}
      disabled={inactivo}
    >
      {cargando ? (
        <ActivityIndicator color={colores.textoSobrePrimario} />
      ) : (
        <Text style={estilos.texto}>{texto}</Text>
      )}
    </TouchableOpacity>
  );
};

const estilos = StyleSheet.create({
  boton: {
    backgroundColor: colores.primario,
    borderRadius: radio,
    paddingVertical: espaciado.sm,
    paddingHorizontal: espaciado.lg,
    alignItems: 'center',
  },
  botonInactivo: {
    backgroundColor: colores.inactivo,
  },
  texto: {
    ...tipografia.cuerpo,
    color: colores.textoSobrePrimario,
  },
});
