import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { NavegadorRaiz } from '../navegacion/NavegadorRaiz';
import { crearPartido } from '../servicios/servicioPartidos';
import { useStoreSesion } from '../stores/useStoreSesion';

// Los servicios se reemplazan por unos falsos con fábrica: el test nunca habla con Firebase.
// escucharCambiosDeSesion nunca avisa, así no cambia el usuario que el test le pone al store.
jest.mock('../servicios/servicioSesion', () => ({
  escucharCambiosDeSesion: jest.fn(() => () => {}),
}));

jest.mock('../servicios/servicioPartidos', () => ({
  crearPartido: jest.fn(),
  editarPartido: jest.fn(),
  eliminarPartido: jest.fn(),
}));

// Mapa es la tab inicial y carga los check-ins al montarse (F02): el servicio se
// simula con fábrica para que no se cargue Firebase y nadie esté jugando (§12)
jest.mock('../servicios/servicioCheckIns', () => ({
  obtenerCheckInsActivos: jest.fn(() =>
    Promise.resolve({ jugadoresPorCancha: {}, miCheckIn: null }),
  ),
  crearCheckIn: jest.fn(),
  terminarCheckIn: jest.fn(),
}));

// El store de check-ins carga expo-location (F03): el servicio se simula con fábrica
// para que no se cargue el módulo nativo real (§12)
jest.mock('../servicios/servicioUbicacion', () => ({
  ubicacionNegada: jest.fn(),
  pedirPermisoUbicacion: jest.fn(),
  obtenerUbicacionActual: jest.fn(),
}));

// En la v14 de Testing Library render y fireEvent son asíncronos: llevan await (§12)
describe('Integración — PantallaFormularioPartido', () => {
  // F05-CA13
  it('valida antes de guardar y, sin conexión, muestra el error con los datos ya convertidos', async () => {
    // El store guarda el error con console.error: se silencia para no ensuciar la salida
    jest.spyOn(console, 'error').mockImplementation(() => {});
    useStoreSesion.setState({
      usuario: { idUsuario: 'uid-prueba', correo: 'ana@correo.com', nombre: 'Ana' },
      revisandoSesion: false,
    });
    // Sin internet, el servicio lanza 'sin-conexion' antes de llamar a Firebase (E3 de F05)
    jest.mocked(crearPartido).mockRejectedValue(new Error('sin-conexion'));

    await render(
      <NavigationContainer>
        <NavegadorRaiz />
      </NavigationContainer>,
    );

    // Historial → [+] (por su accessibilityLabel): se abre "Nuevo partido"
    await fireEvent.press(screen.getByText('Historial'));
    await fireEvent.press(screen.getByLabelText('Nuevo partido'));

    // 1. "Guardar" con todo vacío: aparece el error y no se llama a Firebase
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar' }));
    expect(screen.getByText('Indica si ganaste o perdiste')).toBeOnTheScreen();
    expect(crearPartido).not.toHaveBeenCalled();

    // 2. Datos válidos sin internet: aparece "No hay conexión…"
    await fireEvent.changeText(screen.getByPlaceholderText('Tus puntos'), '12');
    await fireEvent.changeText(screen.getByPlaceholderText('Tus rebotes'), '5');
    await fireEvent.changeText(screen.getByPlaceholderText('Tus asistencias'), '3');
    await fireEvent.press(screen.getByRole('button', { name: 'Ganó' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar' }));

    expect(
      await screen.findByText('No hay conexión. Revisa tu internet e intenta de nuevo.'),
    ).toBeOnTheScreen();
    // Los textos ya llegan convertidos: puntos como número y lo vacío como null
    expect(crearPartido).toHaveBeenCalledWith(
      'uid-prueba',
      expect.objectContaining({ puntos: 12, idCancha: null, marcadorPropio: null }),
    );
  });
});
