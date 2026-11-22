// Vive en el código, no en Firestore (RN05)
export type Cancha = {
  idCancha: string;
  nombre: string;
  latitud: number;
  longitud: number;
};

// Un punto en el mapa. Una Cancha ya tiene esta forma, así que se puede pasar directo (F03, RN02)
export type Coordenadas = {
  latitud: number;
  longitud: number;
};
