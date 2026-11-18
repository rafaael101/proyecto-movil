import {
  validarContrasena,
  validarCorreo,
  validarInicioSesion,
  validarNombre,
} from './validacionesUsuario';

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

// F01-CA22
describe('validarCorreo', () => {
  it('pide el correo si está vacío o solo tiene espacios', () => {
    expect(validarCorreo('')).toBe('Escribe tu correo');
    expect(validarCorreo('   ')).toBe('Escribe tu correo');
  });

  it('rechaza un correo sin punto después de la arroba', () => {
    expect(validarCorreo('ana@correo')).toBe('Correo no válido');
  });

  it('acepta un correo válido con espacios en las orillas', () => {
    expect(validarCorreo(' ana@correo.com ')).toBeNull();
  });
});

// F01-CA23
describe('validarContrasena', () => {
  it('pide la contraseña si está vacía', () => {
    expect(validarContrasena('')).toBe('Escribe tu contraseña');
  });

  it('rechaza una contraseña de menos de 6 caracteres', () => {
    expect(validarContrasena('abc12')).toBe('Mínimo 6 caracteres');
  });

  it('rechaza una contraseña sin números', () => {
    expect(validarContrasena('abcdef')).toBe('Incluye al menos un número');
  });

  it('acepta una contraseña de 6 caracteres con un número', () => {
    expect(validarContrasena('abc123')).toBeNull();
  });
});

// F01-CA23
describe('validarInicioSesion', () => {
  it('no da error de contraseña con una contraseña corta', () => {
    const errores = validarInicioSesion({ correo: 'ana@correo.com', contrasena: 'abc' });
    expect(errores.contrasena).toBeUndefined();
  });
});
