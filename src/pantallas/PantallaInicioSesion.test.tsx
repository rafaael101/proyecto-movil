import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { FirebaseError } from 'firebase/app';

import { NavegadorRaiz } from '../navegacion/NavegadorRaiz';
import { entrarConCorreo } from '../servicios/servicioSesion';
import { useStoreSesion } from '../stores/useStoreSesion';

// El servicio se reemplaza por uno falso: el test nunca habla con Firebase.
// escucharCambiosDeSesion nunca avisa, así no cambia el estado que el test le pone al store.
jest.mock('../servicios/servicioSesion', () => ({
  escucharCambiosDeSesion: jest.fn(() => () => {}),
  entrarConCorreo: jest.fn(),
}));

// El modal de partido (F05) usa el store de partidos, que carga este servicio:
// también se simula con fábrica para que no se cargue Firebase (§12)
jest.mock('../servicios/servicioPartidos', () => ({
  crearPartido: jest.fn(),
  editarPartido: jest.fn(),
  eliminarPartido: jest.fn(),
}));

// Aunque aquí no hay usuario, NavegadorRaiz importa Mapa, que usa el store de check-ins (F02):
// el servicio se simula con fábrica para que no se cargue Firebase (§12)
jest.mock('../servicios/servicioCheckIns', () => ({
  obtenerCheckInsActivos: jest.fn(() =>
    Promise.resolve({ jugadoresPorCancha: {}, miCheckIn: null }),
  ),
}));

// En la v14 de Testing Library render y fireEvent son asíncronos: llevan await (§12)
describe('Integración — PantallaInicioSesion', () => {
  // F01-CA26
  it('con credenciales incorrectas muestra el error y envía el correo ya limpio', async () => {
    useStoreSesion.setState({ usuario: null, revisandoSesion: false });
    // Firebase contesta "credenciales incorrectas"
    jest
      .mocked(entrarConCorreo)
      .mockRejectedValue(new FirebaseError('auth/invalid-credential', ''));

    // Se dibuja NavegadorRaiz como en N9: sin usuario aparece "Iniciar sesión"
    await render(
      <NavigationContainer>
        <NavegadorRaiz />
      </NavigationContainer>,
    );

    // Correo con espacios al inicio y al final (E18)
    await fireEvent.changeText(screen.getByPlaceholderText('tu@correo.com'), '  ana@ejemplo.com  ');
    await fireEvent.changeText(screen.getByPlaceholderText('Tu contraseña'), 'clave123');
    // Se toca el botón por su rol: el header tiene el mismo texto
    await fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }));

    // findBy espera a que aparezca el texto (la petición es asíncrona)
    expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeOnTheScreen();
    expect(entrarConCorreo).toHaveBeenCalledWith('ana@ejemplo.com', 'clave123');
  });
});
