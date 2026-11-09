import type { FC } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colores, tipografia } from '../constantes/tema';
import { PantallaDetalleCancha } from '../pantallas/PantallaDetalleCancha';
import { PantallaFormularioPartido } from '../pantallas/PantallaFormularioPartido';
import { PantallaTarjetaJugador } from '../pantallas/PantallaTarjetaJugador';
import { NavegadorTabs } from './NavegadorTabs';
import { opcionesHeader } from './opcionesHeader';
import type { ParametrosStackRaiz } from './tipos';

const Stack = createNativeStackNavigator<ParametrosStackRaiz>();

// Stack raíz de la app (01-navigation, Árbol de navegación).
// Las tabs son una pantalla más del Stack (Principal); el detalle y los modales
// se abren encima de ellas, por eso ahí no se ve la barra de tabs.
// PROVISIONAL (N6): siempre muestra la parte con sesión; N8 agrega la decisión de sesión
export const NavegadorRaiz: FC = () => {
  return (
    <Stack.Navigator screenOptions={opcionesHeader}>
      {/* headerShown: false porque cada tab trae su propio header (CA11) */}
      <Stack.Screen name="Principal" component={NavegadorTabs} options={{ headerShown: false }} />
      <Stack.Screen name="DetalleCancha" component={PantallaDetalleCancha} options={{ title: 'Cancha' }} />
      {/* presentation: 'modal' = la pantalla sube desde abajo y se cierra deslizando hacia abajo.
          options como función (ejemplo "Header Personalizado" de la clase): recibe
          navigation y route, así el título depende de los parámetros. */}
      <Stack.Screen
        name="FormularioPartido"
        component={PantallaFormularioPartido}
        options={({ navigation, route }) => ({
          presentation: 'modal',
          // Sin idPartido = crear; con idPartido = editar. El "?." es porque
          // params puede ser undefined cuando se abre con navigate('FormularioPartido')
          title: route.params?.idPartido === undefined ? 'Nuevo partido' : 'Editar partido',
          // En iPhone un modal no trae flecha de regreso: se cierra con este botón
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={estilos.botonHeader}>Cancelar</Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="TarjetaJugador"
        component={PantallaTarjetaJugador}
        options={({ navigation }) => ({
          presentation: 'modal',
          title: 'Tarjeta de jugador',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={estilos.botonHeader}>Cerrar</Text>
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
};

const estilos = StyleSheet.create({
  // Mismo naranja que la flecha de regreso (headerTintColor) para que se vean iguales
  botonHeader: {
    ...tipografia.cuerpo,
    color: colores.primario,
  },
});
