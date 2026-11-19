import { NavigationContainer } from '@react-navigation/native';
import { render, screen } from '@testing-library/react-native';

import { useStoreSesion } from '../stores/useStoreSesion';
import { NavegadorRaiz } from './NavegadorRaiz';

// Un test nunca habla con Firebase: se reemplaza el servicio por uno falso.
// NavegadorRaiz empieza a escuchar la sesión al montarse (F01.6): el simulador
// devuelve una función vacía para "dejar de escuchar" y nunca avisa de cambios,
// así no cambia el estado que cada test le pone al store.
jest.mock('../servicios/servicioSesion', () => ({
  escucharCambiosDeSesion: jest.fn(() => () => {}),
}));

// Ionicons carga expo-font, que pide expo-asset; npm lo dejó dentro de la carpeta
// de expo y Jest no lo encuentra (en el iPhone no pasa). El test no revisa iconos,
// así que el icono se reemplaza por un componente que no dibuja nada.
jest.mock('@expo/vector-icons/Ionicons', () => () => null);

// Diferencia con el ejemplo de coding-standards §12: en la versión instalada de
// Testing Library (v14) render es asíncrono, por eso cada it es async y usa await render
describe('Integración — NavegadorRaiz', () => {
  // CA25
  it('sin usuario muestra "Iniciar sesión"', async () => {
    // El store se "simula" poniéndole el estado que queremos probar
    useStoreSesion.setState({ usuario: null, revisandoSesion: false });

    await render(
      <NavigationContainer>
        <NavegadorRaiz />
      </NavigationContainer>,
    );

    // Diferencia con §12: el header del Stack nativo no dibuja el título como <Text>,
    // lo pasa como propiedad title al header de iOS; getAllByText no lo encontraría.
    // queryAll recorre todos los elementos y se queda con los que cumplen la condición.
    expect(
      screen.container.queryAll((nodo) => nodo.props.title === 'Iniciar sesión').length,
    ).toBeGreaterThan(0);
  });

  // CA25
  it('con usuario muestra la tab Mapa', async () => {
    useStoreSesion.setState({
      usuario: { idUsuario: 'usuario-prueba', correo: 'ana@ejemplo.com', nombre: 'Ana' },
      revisandoSesion: false,
    });

    await render(
      <NavigationContainer>
        <NavegadorRaiz />
      </NavigationContainer>,
    );

    // "Canchas cercanas" es el título del header de la tab Mapa
    expect(screen.getAllByText('Canchas cercanas').length).toBeGreaterThan(0);
  });
});
