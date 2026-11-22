import type { FC } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colores, espaciado, tipografia } from '../constantes/tema';
import type { Promedios } from '../tipos/partido';
import { AvisoSinConexion } from './AvisoSinConexion';

type PropsResumenPromedios = {
  promedios: Promedios | null;
  cargando: boolean;
  mensajeError: string | null;
  guardadoEn: string | null;
  alReintentar: () => void;
};

// Sección "Mis promedios" de Perfil (F06). Revisa los estados en el orden de §9,
// pero dentro de la sección: el resto de Perfil (nombre y cerrar sesión) siempre se ve.
// Con 0 partidos se ven los ceros (E17): no hay estado "vacío" aparte.
export const ResumenPromedios: FC<PropsResumenPromedios> = ({
  promedios,
  cargando,
  mensajeError,
  guardadoEn,
  alReintentar,
}) => {
  const dibujarContenido = () => {
    if (cargando) {
      return <ActivityIndicator color={colores.primario} />;
    }
    if (mensajeError !== null) {
      return (
        <View>
          <Text style={estilos.error}>{mensajeError}</Text>
          <TouchableOpacity onPress={alReintentar}>
            <Text style={estilos.reintentar}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (promedios === null) {
      return null; // un instante antes de que empiece la primera carga
    }
    // Enteros tal cual; promedios con 1 decimal siempre (15 → "15.0")
    const filas = [
      { etiqueta: 'Partidos jugados', valor: String(promedios.partidosJugados) },
      { etiqueta: 'Victorias', valor: String(promedios.victorias) },
      { etiqueta: 'Puntos por partido', valor: promedios.puntos.toFixed(1) },
      { etiqueta: 'Rebotes por partido', valor: promedios.rebotes.toFixed(1) },
      { etiqueta: 'Asistencias por partido', valor: promedios.asistencias.toFixed(1) },
    ];
    return (
      <View>
        {guardadoEn !== null && (
          <AvisoSinConexion guardadoEn={guardadoEn} alReintentar={alReintentar} />
        )}
        {filas.map((fila) => (
          <View key={fila.etiqueta} style={estilos.fila}>
            <Text style={estilos.etiqueta}>{fila.etiqueta}</Text>
            <Text style={estilos.valor}>{fila.valor}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>Mis promedios</Text>
      {dibujarContenido()}
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    marginTop: espaciado.lg,
  },
  titulo: {
    ...tipografia.subtitulo,
    color: colores.texto,
    marginBottom: espaciado.sm,
  },
  // Etiqueta a la izquierda y valor a la derecha
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: espaciado.xs,
  },
  etiqueta: {
    ...tipografia.cuerpo,
    color: colores.textoSecundario,
  },
  valor: {
    ...tipografia.cuerpo,
    color: colores.texto,
  },
  error: {
    ...tipografia.pequeno,
    color: colores.error,
  },
  reintentar: {
    ...tipografia.cuerpo,
    color: colores.primario,
    marginTop: espaciado.xs,
  },
});
