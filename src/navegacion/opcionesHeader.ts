import { colores, tipografia } from '../constantes/tema';

// Estilo de header compartido: va en el screenOptions del Stack y del Tab
// para que todos los headers se vean iguales (01-navigation, Headers consistentes).
// En la clase "Stack Navigator" se escribía dentro del screenOptions; aquí está
// en un archivo aparte porque lo usan dos navegadores.
export const opcionesHeader = {
  headerStyle: { backgroundColor: colores.superficie },
  // Color de la flecha de regreso y de los botones del header
  headerTintColor: colores.primario,
  // Sin fontSize: se usa el tamaño estándar de iOS. El peso es '600', el mismo
  // de subtitulo; se toma de tema.ts para no escribir valores sueltos (§7)
  headerTitleStyle: { color: colores.texto, fontWeight: tipografia.subtitulo.fontWeight },
};
