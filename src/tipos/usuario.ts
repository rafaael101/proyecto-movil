// Vive en Firebase Auth; no hay colección de usuarios con datos personales
export type Usuario = {
  idUsuario: string; // uid de Firebase Auth
  correo: string;
  nombre: string; // displayName de Firebase Auth ('' si no se pudo guardar)
};

// Formularios de sesión (F01): todo lo que escribe el usuario es texto
export type ValoresRegistro = {
  nombre: string;
  correo: string;
  contrasena: string;
};

export type ValoresInicioSesion = {
  correo: string;
  contrasena: string;
};

// Un mensaje por campo con error; si el campo no aparece, está bien (mismo patrón que ErroresPartido)
export type ErroresRegistro = Partial<Record<keyof ValoresRegistro, string>>;
export type ErroresInicioSesion = Partial<Record<keyof ValoresInicioSesion, string>>;
