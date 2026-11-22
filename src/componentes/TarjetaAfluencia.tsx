import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { NOMBRES_AFLUENCIA } from '../constantes/configuracion';
import {
  colores,
  coloresAfluencia,
  espaciado,
  radio,
  tamanoMarcador,
  tipografia,
} from '../constantes/tema';
import { obtenerNivelAfluencia } from '../utilidades/afluencia';

type PropsTarjetaAfluencia = {
  jugadores: number | null; // null = sin datos confiables → "?"
};

// Cuántos juegan en la cancha y su nivel (F04, RN07). Solo recibe un número, nunca uids (RN06).
// Misma tarjeta que PanelCheckIn y la misma burbuja que MarcadorCancha (F02).
export const TarjetaAfluencia: FC<PropsTarjetaAfluencia> = ({ jugadores }) => {
  // Sin datos nunca se muestra "0 jugadores · Vacía": sería mentir (02-data-model)
  if (jugadores === null) {
    return (
      <View style={estilos.tarjeta}>
        <View style={[estilos.burbuja, estilos.burbujaSinDatos]}>
          <Text style={[estilos.numero, estilos.numeroSinDatos]}>?</Text>
        </View>
        <Text style={[estilos.texto, estilos.textoSinDatos]}>
          No podemos ver quién está jugando. Actualiza desde el mapa.
        </Text>
      </View>
    );
  }

  const nivel = obtenerNivelAfluencia(jugadores);
  // Singular solo con 1: "1 jugador", "0 jugadores", "7 jugadores"
  const palabraJugadores = jugadores === 1 ? 'jugador' : 'jugadores';

  return (
    <View style={estilos.tarjeta}>
      {/* Estilo en línea porque el color cambia con el número (§7) */}
      <View style={[estilos.burbuja, { backgroundColor: coloresAfluencia[nivel] }]}>
        <Text style={estilos.numero}>{jugadores}</Text>
      </View>
      <Text style={estilos.texto}>
        {jugadores} {palabraJugadores} · {NOMBRES_AFLUENCIA[nivel]}
      </Text>
    </View>
  );
};

const estilos = StyleSheet.create({
  // Burbuja y texto en una fila
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderWidth: 1,
    borderRadius: radio,
    padding: espaciado.md,
  },
  // Círculo: alto y ancho iguales y el radio a la mitad (como MarcadorCancha)
  burbuja: {
    width: tamanoMarcador,
    height: tamanoMarcador,
    borderRadius: tamanoMarcador / 2,
    borderWidth: 2,
    borderColor: colores.superficie,
    justifyContent: 'center',
    alignItems: 'center',
  },
  burbujaSinDatos: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
  },
  numero: {
    ...tipografia.pequeno,
    fontWeight: '700',
    color: colores.textoSobrePrimario,
  },
  numeroSinDatos: {
    color: colores.textoSecundario,
  },
  // flex: 1 para que un texto largo baje de renglón sin salirse de la tarjeta
  texto: {
    ...tipografia.cuerpo,
    color: colores.texto,
    flex: 1,
    marginLeft: espaciado.md,
  },
  textoSinDatos: {
    color: colores.textoSecundario,
  },
});
