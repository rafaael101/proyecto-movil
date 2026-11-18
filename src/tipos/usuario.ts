// Vive en Firebase Auth; no hay colección de usuarios con datos personales
export type Usuario = {
  idUsuario: string; // uid de Firebase Auth
  correo: string;
  nombre: string; // displayName de Firebase Auth ('' si no se pudo guardar)
};
