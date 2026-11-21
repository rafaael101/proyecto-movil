import type { FC } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colores, espaciado, radio, tipografia } from '../constantes/tema';

export type OpcionSelector = { valor: string; etiqueta: string };

type PropsSelectorOpciones = {
  etiqueta: string; // "Cancha (opcional)" o "Resultado"
  opciones: OpcionSelector[];
  valorSeleccionado: string | null; // null = ninguna marcada
  alSeleccionar: (valor: string) => void;
  error?: string; // la pantalla lo pasa solo si el campo está tocado
  deshabilitado?: boolean;
};

// Chips para elegir una sola opción (F05: cancha y resultado).
// Diferencia con la clase: allá se usa Picker; aquí chips, sin dependencias nuevas (F05).
export const SelectorOpciones: FC<PropsSelectorOpciones> = ({
  etiqueta,
  opciones,
  valorSeleccionado,
  alSeleccionar,
  error,
  deshabilitado = false,
}) => {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <View style={estilos.fila}>
        {opciones.map((opcion) => {
          const seleccionado = opcion.valor === valorSeleccionado;
          return (
            <TouchableOpacity
              key={opcion.valor}
              // accessibilityState: VoiceOver dice "seleccionado" y el test puede revisarlo
              accessibilityRole="button"
              accessibilityState={{ selected: seleccionado }}
              style={[estilos.chip, seleccionado && estilos.chipSeleccionado]}
              onPress={() => alSeleccionar(opcion.valor)}
              disabled={deshabilitado}
            >
              <Text style={[estilos.textoChip, seleccionado && estilos.textoChipSeleccionado]}>
                {opcion.etiqueta}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
  // flexWrap: si los chips no caben en una línea, bajan a la siguiente
  fila: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciado.sm,
  },
  chip: {
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio,
    paddingVertical: espaciado.sm,
    paddingHorizontal: espaciado.md,
    maxWidth: '100%', // un nombre de cancha largo se parte en dos líneas en vez de salirse
  },
  chipSeleccionado: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },
  textoChip: {
    ...tipografia.cuerpo,
    color: colores.texto,
  },
  textoChipSeleccionado: {
    color: colores.textoSobrePrimario,
  },
  error: {
    ...tipografia.pequeno,
    color: colores.error,
    marginTop: espaciado.xs,
  },
});
