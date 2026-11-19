import type { FC } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { KeyboardTypeOptions } from 'react-native';

import { colores, espaciado, radio, tipografia } from '../constantes/tema';

type PropsCampoTexto = {
  etiqueta: string; // texto visible arriba del campo
  valor: string;
  alCambiarTexto: (texto: string) => void;
  alSalir: () => void; // onBlur: marca el campo como tocado
  error?: string; // la pantalla lo pasa solo si el campo está tocado
  placeholder?: string;
  deshabilitado?: boolean; // editable={!deshabilitado}
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  autoCorrect?: boolean;
  secureTextEntry?: boolean;
};

// Campo de formulario compartido (F01, F05).
// Diferencia con la clase: allá el campo solo tenía placeholder; aquí también lleva
// etiqueta visible arriba, porque el placeholder desaparece al escribir (F01).
// El componente no sabe si el campo está tocado: muestra el error si se lo pasan.
export const CampoTexto: FC<PropsCampoTexto> = ({
  etiqueta,
  valor,
  alCambiarTexto,
  alSalir,
  error,
  placeholder,
  deshabilitado = false,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  secureTextEntry,
}) => {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <TextInput
        // Estilo condicional como en la clase "Validación de Formularios":
        // con error, el borde cambia de color
        style={[estilos.campo, error !== undefined && estilos.campoConError]}
        value={valor}
        onChangeText={alCambiarTexto}
        onBlur={alSalir}
        placeholder={placeholder}
        editable={!deshabilitado}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        secureTextEntry={secureTextEntry}
      />
      {error !== undefined && <Text style={estilos.error}>{error}</Text>}
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    marginBottom: espaciado.md,
  },
  etiqueta: {
    ...tipografia.pequeno,
    color: colores.texto,
    marginBottom: espaciado.xs,
  },
  campo: {
    ...tipografia.cuerpo,
    color: colores.texto,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio,
    paddingVertical: espaciado.sm,
    paddingHorizontal: espaciado.md,
  },
  campoConError: {
    borderColor: colores.error,
  },
  error: {
    ...tipografia.pequeno,
    color: colores.error,
    marginTop: espaciado.xs,
  },
});
