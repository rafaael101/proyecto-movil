import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { NavegadorRaiz } from '../navegacion/NavegadorRaiz';
import { leerCacheHistorial } from '../servicios/servicioCache';
import { obtenerPaginaPartidos } from '../servicios/servicioPartidos';
import { useStorePartidos } from '../stores/useStorePartidos';
import { useStoreSesion } from '../stores/useStoreSesion';
import type { Partido } from '../tipos/partido';

// Todos los servicios se reemplazan por unos falsos con fábrica: el test nunca habla
// con Firebase ni con el teléfono (§12)
jest.mock('../servicios/servicioSesion', () => ({
  escucharCambiosDeSesion: jest.fn(() => () => {}),
}));

// Mapa es la tab inicial y carga los check-ins al montarse (como en F02.6)
jest.mock('../servicios/servicioCheckIns', () => ({
  obtenerCheckInsActivos: jest.fn(() =>
    Promise.resolve({ jugadoresPorCancha: {}, miCheckIn: null }),
  ),
}));

jest.mock('../servicios/servicioPartidos', () => ({
  crearPartido: jest.fn(),
  editarPartido: jest.fn(),
  eliminarPartido: jest.fn(),
  obtenerPaginaPartidos: jest.fn(),
  obtenerTodosLosPartidos: jest.fn(),
}));

// Sin internet: el store debe ir a la caché (RN11)
jest.mock('../servicios/servicioConexion', () => ({
  hayConexion: jest.fn(() => Promise.resolve(false)),
}));

jest.mock('../servicios/servicioCache', () => ({
  leerCacheHistorial: jest.fn(),
  guardarCacheHistorial: jest.fn(),
  borrarCacheHistorial: jest.fn(),
}));

// El partido de F06-CA02: 2 nov en Sullivan, ganado, 14/6/3
const PARTIDO: Partido = {
  idPartido: 'partido-1',
  fecha: '2026-11-02',
  idCancha: 'sullivan',
  resultado: 'gano',
  puntos: 14,
  rebotes: 6,
  asistencias: 3,
  marcadorPropio: 21,
  marcadorRival: 17,
};

// Dibuja la app con sesión y abre la tab Historial
async function abrirHistorial() {
  useStoreSesion.setState({
    usuario: { idUsuario: 'uid-prueba', correo: 'ana@correo.com', nombre: 'Ana' },
    revisandoSesion: false,
  });
  await render(
    <NavigationContainer>
      <NavegadorRaiz />
    </NavigationContainer>,
  );
  await fireEvent.press(screen.getByText('Historial'));
}

// En la v14 de Testing Library render y fireEvent son asíncronos: llevan await (§12)
describe('Integración — PantallaHistorial', () => {
  beforeEach(() => {
    // El store guarda su estado entre tests: se empieza limpio cada vez
    useStorePartidos.getState().limpiar();
  });

  // F06-CA14 (1)
  it('sin internet y con caché muestra el aviso y los partidos guardados', async () => {
    jest.mocked(leerCacheHistorial).mockResolvedValue({
      idUsuario: 'uid-prueba',
      guardadoEn: new Date(2026, 10, 2, 18, 40).toISOString(),
      partidos: [PARTIDO],
    });

    await abrirHistorial();

    expect(await screen.findByText(/Sin conexión — datos guardados el/)).toBeOnTheScreen();
    expect(screen.getByText('14 pts · 6 reb · 3 ast')).toBeOnTheScreen();
    // Sin internet no se pide nada a Firestore
    expect(obtenerPaginaPartidos).not.toHaveBeenCalled();
  });

  // F06-CA14 (2)
  it('sin internet y sin caché muestra "Sin conexión y sin datos guardados"', async () => {
    jest.mocked(leerCacheHistorial).mockResolvedValue(null);

    await abrirHistorial();

    expect(await screen.findByText('Sin conexión y sin datos guardados')).toBeOnTheScreen();
  });
});
