import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Marker } from 'react-native-maps';

import { colores, coloresAfluencia, tamanoMarcador, tipografia } from '../constantes/tema';
import type { Cancha } from '../tipos/cancha';
import { obtenerNivelAfluencia } from '../utilidades/afluencia';

type PropsMarcadorCancha = {
  cancha: Cancha;
  jugadores: number | null; // null = sin datos → "?"
  alPresionar: (idCancha: string) => void; // → navigate('DetalleCancha', { idCancha })
};

// Burbuja de una cancha en el mapa (F02): su número de jugadores con el color de su
// nivel (RN07). Marker es un componente visual nativo: se usa aquí (§4, excepción 2).
export const MarcadorCancha: FC<PropsMarcadorCancha> = ({ cancha, jugadores, alPresionar }) => {
  const sinDatos = jugadores === null;

  return (
    // Sin title: un toque abre el detalle directo, sin globo de texto
    <Marker
      coordinate={{ latitude: cancha.latitud, longitude: cancha.longitud }}
      onPress={() => alPresionar(cancha.idCancha)}
    >
      <View
        style={[
          estilos.burbuja,
          // Estilo en línea porque el color cambia con el número (§7)
          sinDatos
            ? estilos.burbujaSinDatos
            : { backgroundColor: coloresAfluencia[obtenerNivelAfluencia(jugadores)] },
        ]}
      >
        <Text style={[estilos.numero, sinDatos && estilos.numeroSinDatos]}>
          {sinDatos ? '?' : jugadores}
        </Text>
      </View>
    </Marker>
  );
};

const estilos = StyleSheet.create({
  // Círculo: alto y ancho iguales y el radio a la mitad
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
});
