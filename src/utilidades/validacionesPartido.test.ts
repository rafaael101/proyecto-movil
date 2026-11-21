import type { ValoresFormularioPartido } from '../tipos/partido';
import {
  convertirAPartido,
  crearValoresVacios,
  validarCancha,
  validarEstadistica,
  validarFecha,
  validarMarcador,
  validarPartido,
} from './validacionesPartido';

// Fecha fija: el resultado no cambia según el día en que se corra la prueba
const HOY = '2026-11-02';

// CAD17
describe('validarFecha', () => {
  it('pide la fecha si está vacía o solo tiene espacios', () => {
    expect(validarFecha('', HOY)).toBe('Escribe la fecha del partido');
    expect(validarFecha('   ', HOY)).toBe('Escribe la fecha del partido');
  });

  it('rechaza un formato malo y un día que no existe', () => {
    expect(validarFecha('02/11/2026', HOY)).toBe('Fecha no válida');
    expect(validarFecha('2026-11-2', HOY)).toBe('Fecha no válida');
    expect(validarFecha('2026-02-30', HOY)).toBe('Fecha no válida');
  });

  it('rechaza una fecha futura', () => {
    expect(validarFecha('2026-11-03', HOY)).toBe('La fecha no puede ser futura');
  });

  it('acepta hoy y una fecha pasada', () => {
    expect(validarFecha('2026-11-02', HOY)).toBeNull();
    expect(validarFecha('2026-10-15', HOY)).toBeNull();
  });
});

// E16 de 02-data-model (validarCancha no tiene CAD propio)
describe('validarCancha', () => {
  it('acepta sin cancha y una cancha del catálogo', () => {
    expect(validarCancha(null)).toBeNull();
    expect(validarCancha('sullivan')).toBeNull();
  });

  it('rechaza una cancha que no está en el catálogo', () => {
    expect(validarCancha('mi-casa')).toBe('Elige una cancha de la lista');
  });
});

// CAD18
describe('validarEstadistica', () => {
  it('pide el dato si está vacío, con el nombre del campo', () => {
    expect(validarEstadistica('', 'puntos')).toBe('Escribe tus puntos');
  });

  it('rechaza negativos y decimales', () => {
    expect(validarEstadistica('-3', 'puntos')).toBe('Usa solo números enteros');
    expect(validarEstadistica('4.5', 'puntos')).toBe('Usa solo números enteros');
  });

  it('rechaza más de 100', () => {
    expect(validarEstadistica('101', 'puntos')).toBe('Máximo 100');
  });

  it('acepta un entero válido', () => {
    expect(validarEstadistica('12', 'puntos')).toBeNull();
  });
});

// CAD19
describe('validarMarcador (los dos o ninguno)', () => {
  it('acepta los dos marcadores vacíos', () => {
    expect(validarMarcador('', '', 'gano', '10')).toBeNull();
  });

  it('pide los dos si solo uno está lleno', () => {
    expect(validarMarcador('21', '', 'gano', '10')).toBe(
      'Escribe los dos marcadores o deja ambos vacíos',
    );
    expect(validarMarcador('', '17', 'gano', '10')).toBe(
      'Escribe los dos marcadores o deja ambos vacíos',
    );
  });
});

// CAD20
describe('validarMarcador (coherencia)', () => {
  it('rechaza un empate', () => {
    expect(validarMarcador('20', '20', 'gano', '10')).toBe('En básquet no hay empates');
  });

  it('rechaza "ganó" con marcador menor', () => {
    expect(validarMarcador('15', '20', 'gano', '10')).toBe(
      'Si ganaste, tu marcador debe ser mayor',
    );
  });

  it('rechaza puntos mayores que el marcador propio', () => {
    expect(validarMarcador('21', '17', 'gano', '25')).toBe(
      'Tus puntos no pueden ser más que los de tu equipo',
    );
  });

  it('no revisa los puntos si no son un entero válido', () => {
    expect(validarMarcador('21', '17', 'gano', '4.5')).toBeNull();
  });

  it('devuelve el primer mensaje de la tabla si hay varios problemas', () => {
    // Empate y puntos de más: gana "no hay empates", que va antes en la tabla
    expect(validarMarcador('20', '20', 'gano', '25')).toBe('En básquet no hay empates');
  });
});

// F05-CA02: "Guardar" sin llenar nada
describe('validarPartido', () => {
  it('con el formulario vacío pide resultado, puntos, rebotes y asistencias', () => {
    const valores: ValoresFormularioPartido = {
      fecha: HOY,
      idCancha: null,
      resultado: null,
      puntos: '',
      rebotes: '',
      asistencias: '',
      marcadorPropio: '',
      marcadorRival: '',
    };
    expect(validarPartido(valores, HOY)).toEqual({
      resultado: 'Indica si ganaste o perdiste',
      puntos: 'Escribe tus puntos',
      rebotes: 'Escribe tus rebotes',
      asistencias: 'Escribe tus asistencias',
    });
  });
});

// CAD21
describe('convertirAPartido', () => {
  it('convierte los textos a números y el marcador vacío a null', () => {
    const valores: ValoresFormularioPartido = {
      fecha: HOY,
      idCancha: 'sullivan',
      resultado: 'gano',
      puntos: '12',
      rebotes: ' 5 ',
      asistencias: '3',
      marcadorPropio: '',
      marcadorRival: '',
    };
    expect(convertirAPartido(valores)).toEqual({
      fecha: HOY,
      idCancha: 'sullivan',
      resultado: 'gano',
      puntos: 12,
      rebotes: 5,
      asistencias: 3,
      marcadorPropio: null,
      marcadorRival: null,
    });
  });

  it('convierte un marcador lleno a números', () => {
    const valores: ValoresFormularioPartido = {
      fecha: HOY,
      idCancha: null,
      resultado: 'perdio',
      puntos: '8',
      rebotes: '2',
      asistencias: '1',
      marcadorPropio: '15',
      marcadorRival: '21',
    };
    const datos = convertirAPartido(valores);
    expect(datos.marcadorPropio).toBe(15);
    expect(datos.marcadorRival).toBe(21);
  });
});

// F05-CA01: "Nuevo partido" abre con la fecha de hoy, "Sin cancha", ningún resultado y lo demás vacío
describe('crearValoresVacios', () => {
  it('pone la fecha de hoy, sin cancha, sin resultado y lo demás vacío', () => {
    expect(crearValoresVacios(HOY)).toEqual({
      fecha: HOY,
      idCancha: null,
      resultado: null,
      puntos: '',
      rebotes: '',
      asistencias: '',
      marcadorPropio: '',
      marcadorRival: '',
    });
  });
});
