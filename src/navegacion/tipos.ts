import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Equivale al RootStackParamList de la clase "Stack Navigator".
// Cada ruta dice qué parámetros recibe (undefined = ninguno).
// Solo viajan ids, nunca el objeto completo (01-navigation, Regla de parámetros).
export type ParametrosStackRaiz = {
  // Sin sesión
  InicioSesion: undefined;
  Registro: undefined;
  // Con sesión
  Principal: undefined; // contiene las tabs
  DetalleCancha: { idCancha: string };
  FormularioPartido: { idPartido?: string } | undefined; // sin idPartido = crear, con idPartido = editar
  TarjetaJugador: { idPartido: string };
};

// Equivale al TabParamList de la clase "Tab Navigator".
export type ParametrosTabs = {
  Mapa: undefined;
  Historial: undefined;
  Perfil: undefined;
};

// Pantallas del Stack: igual que en clase.
export type PropsPantallaInicioSesion = NativeStackScreenProps<ParametrosStackRaiz, 'InicioSesion'>;
export type PropsPantallaRegistro = NativeStackScreenProps<ParametrosStackRaiz, 'Registro'>;
export type PropsPantallaDetalleCancha = NativeStackScreenProps<ParametrosStackRaiz, 'DetalleCancha'>;
export type PropsPantallaFormularioPartido = NativeStackScreenProps<ParametrosStackRaiz, 'FormularioPartido'>;
export type PropsPantallaTarjetaJugador = NativeStackScreenProps<ParametrosStackRaiz, 'TarjetaJugador'>;

// Pantallas de Tab: viven dentro de las tabs, pero también navegan
// a rutas del Stack raíz (por ejemplo, Mapa → DetalleCancha).
// CompositeScreenProps = "es una tab y además puede navegar al Stack de afuera".
// En la clase "Tab Navigator" se usó navigation: any; aquí no, porque el proyecto prohíbe any.
export type PropsPantallaMapa = CompositeScreenProps<
  BottomTabScreenProps<ParametrosTabs, 'Mapa'>,
  NativeStackScreenProps<ParametrosStackRaiz>
>;
export type PropsPantallaHistorial = CompositeScreenProps<
  BottomTabScreenProps<ParametrosTabs, 'Historial'>,
  NativeStackScreenProps<ParametrosStackRaiz>
>;
export type PropsPantallaPerfil = CompositeScreenProps<
  BottomTabScreenProps<ParametrosTabs, 'Perfil'>,
  NativeStackScreenProps<ParametrosStackRaiz>
>;
