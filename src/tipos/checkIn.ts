export type CheckIn = {
  idUsuario: string;
  idCancha: string;
  creadoEn: Date;
  expiraEn: Date; // creadoEn + CHECK_IN_DURACION_MINUTOS (RN01), calculado en la app
};

// Niveles de RN07
export type NivelAfluencia = 'vacia' | 'poca' | 'reta' | 'llena';

// Lo que devuelve "obtener check-ins activos": solo números (RN06)
export type ResumenAfluencia = {
  // Record<string, number>: objeto con llaves de texto y valores numéricos
  jugadoresPorCancha: Record<string, number>; // llave: idCancha · valor: jugadores activos
  miCheckIn: CheckIn | null; // el check-in activo del usuario actual, o null
};
