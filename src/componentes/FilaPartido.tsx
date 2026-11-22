import type { FC } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { colores, espaciado, radio, tamanoIcono, tipografia } from '../constantes/tema';
import type { Partido } from '../tipos/partido';
import { obtenerNombreCancha } from '../utilidades/canchas';
import { formatearFecha } from '../utilidades/fechas';

type PropsFilaPartido = {
  partido: Partido;
  alPresionar: (idPartido: string) => void; // → navigate('FormularioPartido', { idPartido })
  alPresionarTarjeta: (idPartido: string) => void; // → navigate('TarjetaJugador', { idPartido })
};

// Una fila del Historial (F06): fecha y resultado, estadísticas y cancha.
// Toda la fila abre "Editar partido"; el icono de la derecha abre la tarjeta.
export const FilaPartido: FC<PropsFilaPartido> = ({ partido, alPresionar, alPresionarTarjeta }) => {
  const gano = partido.resultado === 'gano';

  return (
    <TouchableOpacity style={estilos.fila} onPress={() => alPresionar(partido.idPartido)}>
      <View style={estilos.datos}>
        <Text style={estilos.lineaPrincipal}>
          {formatearFecha(partido.fecha)} ·{' '}
          <Text style={gano ? estilos.gano : estilos.perdio}>{gano ? 'Ganó' : 'Perdió'}</Text>
        </Text>
        <Text style={estilos.estadisticas}>
          {`${partido.puntos} pts · ${partido.rebotes} reb · ${partido.asistencias} ast`}
        </Text>
        <Text style={estilos.cancha}>{obtenerNombreCancha(partido.idCancha)}</Text>
      </View>
      {/* Un botón dentro de otro: al tocar el icono responde solo el icono */}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Ver tarjeta"
        onPress={() => alPresionarTarjeta(partido.idPartido)}
      >
        <Ionicons name="id-card-outline" size={tamanoIcono} color={colores.primario} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderRadius: radio,
    padding: espaciado.md,
    marginBottom: espaciado.sm,
  },
  // flex: 1 ocupa el espacio que deja el icono
  datos: {
    flex: 1,
    marginRight: espaciado.sm,
  },
  lineaPrincipal: {
    ...tipografia.cuerpo,
    fontWeight: '600',
    color: colores.texto,
  },
  gano: {
    color: colores.exito,
  },
  perdio: {
    color: colores.error,
  },
  estadisticas: {
    ...tipografia.cuerpo,
    color: colores.texto,
  },
  cancha: {
    ...tipografia.pequeno,
    color: colores.textoSecundario,
  },
});
