import { validarNombre } from './validacionesUsuario';

// E4 de F01 (validarNombre no tiene CAD propio en 02-data-model)
describe('validarNombre', () => {
  it('pide el nombre si está vacío o solo tiene espacios', () => {
    expect(validarNombre('')).toBe('Escribe tu nombre');
    expect(validarNombre('   ')).toBe('Escribe tu nombre');
  });

  it('rechaza un nombre de 1 carácter', () => {
    expect(validarNombre('A')).toBe('Mínimo 2 caracteres');
  });

  it('rechaza un nombre de más de 30 caracteres', () => {
    expect(validarNombre('A'.repeat(31))).toBe('Máximo 30 caracteres');
  });

  it('acepta los límites de 2 y 30 caracteres', () => {
    expect(validarNombre('Al')).toBeNull();
    expect(validarNombre('A'.repeat(30))).toBeNull();
  });

  it('ignora los espacios de las orillas al contar', () => {
    expect(validarNombre('  A  ')).toBe('Mínimo 2 caracteres');
    expect(validarNombre('  Rafa  ')).toBeNull();
  });
});
