import type { CheckIn } from '../tipos/checkIn';
import { calcularExpiracion, calcularLimiteActivos, estaActivo, minutosRestantes } from './checkIns';

// Las fechas se arman en hora local con new Date(año, mes, día, hora, minuto):
// el resultado no depende de la zona horaria de la laptop. (Mes 10 = noviembre.)

// Check-in de prueba que vence a las 19:30 del 2 de noviembre
const CHECK_IN: CheckIn = {
  idUsuario: 'usuario-a',
  idCancha: 'sullivan',
  creadoEn: new Date(2026, 10, 2, 18, 0),
  expiraEn: new Date(2026, 10, 2, 19, 30),
};

// CAD22
describe('calcularExpiracion', () => {
  it('suma 90 minutos: 18:00 → 19:30', () => {
    expect(calcularExpiracion(new Date(2026, 10, 2, 18, 0))).toEqual(new Date(2026, 10, 2, 19, 30));
  });
});

// CAD22
describe('minutosRestantes', () => {
  it('con vencimiento a las 19:30 y ahora 19:00 quedan 30', () => {
    expect(minutosRestantes(CHECK_IN, new Date(2026, 10, 2, 19, 0))).toBe(30);
  });

  it('con 30 segundos restantes redondea hacia arriba a 1', () => {
    expect(minutosRestantes(CHECK_IN, new Date(2026, 10, 2, 19, 29, 30))).toBe(1);
  });

  it('vencido devuelve 0, nunca negativo', () => {
    expect(minutosRestantes(CHECK_IN, new Date(2026, 10, 2, 20, 0))).toBe(0);
  });
});

// RN01 (calcularLimiteActivos y estaActivo no tienen CAD propio)
describe('calcularLimiteActivos', () => {
  it('resta 90 minutos: 19:30 → 18:00', () => {
    expect(calcularLimiteActivos(new Date(2026, 10, 2, 19, 30))).toEqual(
      new Date(2026, 10, 2, 18, 0),
    );
  });
});

// RN01
describe('estaActivo', () => {
  it('está activo antes de vencer y deja de estarlo al vencer', () => {
    expect(estaActivo(CHECK_IN, new Date(2026, 10, 2, 19, 0))).toBe(true);
    expect(estaActivo(CHECK_IN, new Date(2026, 10, 2, 19, 30))).toBe(false);
  });
});
