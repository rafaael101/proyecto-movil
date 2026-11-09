import type { FC } from 'react';
import { useLayoutEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { colores, espaciado, radio, tipografia } from '../constantes/tema';
import type { PropsPantallaHistorial } from '../navegacion/tipos';

// PROVISIONAL (N7): id falso para probar los modales; se quita cuando F06 ponga la lista real
const ID_PARTIDO_PRUEBA = 'partido-prueba';

// PROVISIONAL (N4): el contenido real lo pone F06
export const PantallaHistorial: FC<PropsPantallaHistorial> = ({ navigation }) => {
  // El [+] se pone aquí y no en NavegadorTabs: en las opciones de la tab,
  // navigation solo conoce Mapa, Historial y Perfil, y TypeScript no deja
  // navegar a FormularioPartido. Aquí navigation es CompositeScreenProps (tipos.ts),
  // que sí conoce las rutas del Stack raíz.
  // useLayoutEffect (actividad 3 de la clase "Stack Navigator"): cambia el header
  // antes de que se dibuje la pantalla, así el botón no aparece "de golpe".
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('FormularioPartido')}>
          {/* tema.ts no tiene tamaño de icono: se usa el del título (28) */}
          <Ionicons name="add" size={tipografia.titulo.fontSize} color={colores.primario} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.texto}>PantallaHistorial</Text>
      {/* PROVISIONAL (N7): se quitan cuando F06 ponga la lista con sus partidos y su control de tarjeta */}
      <TouchableOpacity
        style={estilos.boton}
        onPress={() => navigation.navigate('FormularioPartido', { idPartido: ID_PARTIDO_PRUEBA })}
      >
        <Text style={estilos.textoBoton}>Editar partido de prueba</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={estilos.boton}
        onPress={() => navigation.navigate('TarjetaJugador', { idPartido: ID_PARTIDO_PRUEBA })}
      >
        <Text style={estilos.textoBoton}>Ver tarjeta de prueba</Text>
      </TouchableOpacity>
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
  texto: {
    ...tipografia.cuerpo,
    color: colores.texto,
  },
  boton: {
    backgroundColor: colores.primario,
    borderRadius: radio,
    paddingVertical: espaciado.sm,
    paddingHorizontal: espaciado.lg,
    marginTop: espaciado.md,
  },
  textoBoton: {
    ...tipografia.cuerpo,
    color: colores.textoSobrePrimario,
  },
});
