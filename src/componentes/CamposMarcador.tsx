import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, tipografia } from '../constantes/tema';
import { CampoTexto } from './CampoTexto';

type PropsCamposMarcador = {
  marcadorPropio: string;
  marcadorRival: string;
  alCambiarPropio: (texto: string) => void;
  alCambiarRival: (texto: string) => void;
  alSalir: () => void; // los dos campos vuelven a validar el marcador al salir
  error?: string; // el formulario lo pasa solo si alguno de los dos está tocado
  deshabilitado?: boolean;
};

// Marcador final del partido (F05): dos campos en una fila y un solo mensaje de error
// debajo de los dos, porque el error abarca ambos (02-data-model). Va aparte para que
// FormularioPartido no pase de ~150 líneas (coding-standards §6).
export const CamposMarcador: FC<PropsCamposMarcador> = ({
  marcadorPropio,
  marcadorRival,
  alCambiarPropio,
  alCambiarRival,
  alSalir,
  error,
  deshabilitado = false,
}) => {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>Marcador final (opcional)</Text>
      <View style={estilos.fila}>
        <View style={estilos.columna}>
          <CampoTexto
            etiqueta="Tu equipo"
            valor={marcadorPropio}
            alCambiarTexto={alCambiarPropio}
            alSalir={alSalir}
            deshabilitado={deshabilitado}
            keyboardType="number-pad"
          />
        </View>
        <View style={estilos.columna}>
          <CampoTexto
            etiqueta="Rival"
            valor={marcadorRival}
            alCambiarTexto={alCambiarRival}
            alSalir={alSalir}
            deshabilitado={deshabilitado}
            keyboardType="number-pad"
          />
        </View>
      </View>
      {error !== undefined && <Text style={estilos.error}>{error}</Text>}
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    marginBottom: espaciado.md,
  },
  titulo: {
    ...tipografia.pequeno,
    color: colores.texto,
    marginBottom: espaciado.xs,
  },
  fila: {
    flexDirection: 'row',
    gap: espaciado.md,
  },
  // flex: 1 en cada columna: los dos campos miden lo mismo
  columna: {
    flex: 1,
  },
  error: {
    ...tipografia.pequeno,
    color: colores.error,
  },
});
