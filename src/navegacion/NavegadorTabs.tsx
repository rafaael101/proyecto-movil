import type { FC } from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colores } from '../constantes/tema';
import { PantallaHistorial } from '../pantallas/PantallaHistorial';
import { PantallaMapa } from '../pantallas/PantallaMapa';
import { PantallaPerfil } from '../pantallas/PantallaPerfil';
import { opcionesHeader } from './opcionesHeader';
import type { ParametrosTabs } from './tipos';

const Tab = createBottomTabNavigator<ParametrosTabs>();

// Las 3 tabs de la app con sesión (01-navigation, Tabs e iconos).
// En la clase "Tab Navigator" los iconos eran emojis en un <Text>; aquí son
// Ionicons porque cambian de color solos con la tab activa (CA09).
export const NavegadorTabs: FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Mapa"
      screenOptions={{
        ...opcionesHeader,
        tabBarActiveTintColor: colores.primario,
        tabBarInactiveTintColor: colores.inactivo,
        tabBarStyle: { backgroundColor: colores.superficie },
      }}
    >
      {/* title = texto del header; tabBarLabel = texto debajo del icono */}
      <Tab.Screen
        name="Mapa"
        component={PantallaMapa}
        options={{
          title: 'Canchas cercanas',
          tabBarLabel: 'Mapa',
          // focused = la tab está activa: icono relleno; si no, de contorno.
          // color y size los manda la barra de tabs (activo o inactivo).
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Historial"
        component={PantallaHistorial}
        options={{
          title: 'Mis partidos',
          tabBarLabel: 'Historial',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'list' : 'list-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PantallaPerfil}
        options={{
          title: 'Mi perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
