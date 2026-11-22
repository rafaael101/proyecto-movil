import type { FC } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { colores, espaciado, radio, tamanoFotoTarjeta, tipografia } from '../constantes/tema';
import type { Partido } from '../tipos/partido';
import { obtenerNombreCancha } from '../utilidades/canchas';
import { formatearFecha } from '../utilidades/fechas';

type PropsTarjetaJugador = {
  nombre: string; // ya pasado por obtenerNombreVisible
  partido: Partido;
  uriFoto: string | null; // null = sin foto
};

// La tarjeta de un partido que se convierte en imagen (F07). Solo props (§4).
// Sin marcador, igual que FilaPartido.
export const TarjetaJugador: FC<PropsTarjetaJugador> = ({ nombre, partido, uriFoto }) => {
  const gano = partido.resultado === 'gano';

  return (
    <View style={estilos.tarjeta}>
      {uriFoto !== null ? (
        <Image source={{ uri: uriFoto }} resizeMode="cover" style={estilos.foto} />
      ) : (
        // Sin foto: círculo gris del mismo tamaño con el icono en el centro (E8)
        <View style={[estilos.foto, estilos.sinFoto]}>
          <Ionicons name="person" size={tamanoFotoTarjeta / 2} color={colores.inactivo} />
        </View>
      )}
      <Text style={estilos.nombre}>{nombre}</Text>
      <Text style={estilos.lineaPrincipal}>
        {formatearFecha(partido.fecha)} ·{' '}
        <Text style={gano ? estilos.gano : estilos.perdio}>{gano ? 'Ganó' : 'Perdió'}</Text>
      </Text>
      <Text style={estilos.estadisticas}>
        {`${partido.puntos} pts · ${partido.rebotes} reb · ${partido.asistencias} ast`}
      </Text>
      <Text style={estilos.cancha}>{obtenerNombreCancha(partido.idCancha)}</Text>
      <Text style={estilos.marca}>HoopsMap</Text>
    </View>
  );
};

const estilos = StyleSheet.create({
  tarjeta: {
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderWidth: 1,
    borderRadius: radio,
    padding: espaciado.lg,
  },
  // Círculo: alto y ancho iguales y el radio a la mitad
  foto: {
    width: tamanoFotoTarjeta,
    height: tamanoFotoTarjeta,
    borderRadius: tamanoFotoTarjeta / 2,
  },
  sinFoto: {
    backgroundColor: colores.borde,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nombre: {
    ...tipografia.titulo,
    color: colores.texto,
    marginTop: espaciado.md,
    textAlign: 'center',
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
    ...tipografia.subtitulo,
    color: colores.texto,
  },
  cancha: {
    ...tipografia.pequeno,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
  marca: {
    ...tipografia.pequeno,
    fontWeight: '600',
    color: colores.primario,
    marginTop: espaciado.md,
  },
});
