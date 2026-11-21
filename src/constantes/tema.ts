// Paleta, tipografía, espaciado y radio de la app (01-navigation, Paleta y tipografía).
// "as const" = estos valores no cambian; TypeScript los trata como fijos
export const colores = {
  primario: '#C2410C',
  textoSobrePrimario: '#FFFFFF',
  fondo: '#F7F7F5',
  superficie: '#FFFFFF',
  texto: '#1C1C1E',
  textoSecundario: '#6B6B70',
  inactivo: '#8E8E93',
  borde: '#E5E5EA',
  error: '#C62828',
  exito: '#2E7D32',
} as const;

// Fuente del sistema (San Francisco en iPhone): solo se definen tamaño y peso
export const tipografia = {
  titulo: { fontSize: 28, fontWeight: '700' },
  subtitulo: { fontSize: 20, fontWeight: '600' },
  cuerpo: { fontSize: 16, fontWeight: '400' },
  pequeno: { fontSize: 13, fontWeight: '400' },
} as const;

export const espaciado = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const radio = 12;

export const tamanoIcono = 28; // iconos del header (01-navigation)

// Colores de los niveles de afluencia (RN07). Las llaves son NivelAfluencia.
// Todos llevan texto blanco encima con contraste ≥ 4.5:1.
export const coloresAfluencia = {
  vacia: '#6B6B70', // gris
  poca: '#2E7D32', // verde
  reta: '#C2410C', // naranja
  llena: '#C62828', // rojo
} as const;

export const tamanoMarcador = 36; // diámetro de la burbuja del mapa (F02)
