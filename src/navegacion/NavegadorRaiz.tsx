import type { FC } from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
      {/* presentation: 'modal' = la pantalla sube desde abajo y se cierra deslizando hacia abajo */}
      <Stack.Screen
        name="FormularioPartido"
        component={PantallaFormularioPartido}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="TarjetaJugador"
        component={PantallaTarjetaJugador}
        options={{ presentation: 'modal', title: 'Tarjeta de jugador' }}
      />
    </Stack.Navigator>
  );
};
