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

// Desde Testing Library v14 render es asíncrono: cada it es async y usa await render (§12)
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

    // Se busca el botón por su rol: el título del header nativo no es un <Text> (§12)
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeOnTheScreen();
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
