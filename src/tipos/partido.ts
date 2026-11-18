export type ResultadoPartido = 'gano' | 'perdio';

export type Partido = {
  idPartido: string;
  fecha: string; // 'AAAA-MM-DD', día local del partido
  idCancha: string | null; // null = no eligió cancha
  resultado: ResultadoPartido;
  puntos: number;
  rebotes: number;
  asistencias: number;
  marcadorPropio: number | null; // null = sin marcador
  marcadorRival: number | null;
};

// Lo que se manda a Firestore al crear o editar: todo menos el id
// Omit<Partido, 'idPartido'>: un Partido sin el campo idPartido
export type DatosPartido = Omit<Partido, 'idPartido'>;

// Lo que escribe el usuario en un TextInput siempre es texto;
// se convierte a número después de validar (F05)
export type ValoresFormularioPartido = {
  fecha: string;
  idCancha: string | null;
  resultado: ResultadoPartido | null; // null = todavía no elige
  puntos: string;
  rebotes: string;
  asistencias: string;
  marcadorPropio: string; // '' = vacío
  marcadorRival: string;
};

// Un mensaje por campo con error; si el campo no aparece, está bien.
// Usa los mismos nombres que ValoresFormularioPartido para encajar con useFormulario.
// Se lee: "un objeto con las llaves del formulario y textos como valores (Record),
// donde cada llave es opcional (Partial)".
export type ErroresPartido = Partial<Record<keyof ValoresFormularioPartido, string>>;
// El error del marcador (abarca los dos campos) se guarda en marcadorPropio
// y el formulario lo muestra una sola vez, debajo de los dos campos.

export type Promedios = {
  partidosJugados: number;
  victorias: number;
  puntos: number; // promedio por partido, 1 decimal
  rebotes: number;
  asistencias: number;
};

// Lo que se guarda en AsyncStorage para ver el historial sin conexión (RN11)
export type CacheHistorial = {
  idUsuario: string; // de quién son estos partidos
  guardadoEn: string; // ISO 8601, para el aviso "Datos guardados el…"
  partidos: Partido[]; // la última lista COMPLETA descargada
};
