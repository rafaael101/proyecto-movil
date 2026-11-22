import type { FC } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colores, espaciado, tipografia } from '../constantes/tema';
import { BotonPrincipal } from './BotonPrincipal';

type PropsAccionesTarjeta = {
  permisoCamaraNegado: boolean;
  trabajando: boolean;
  mensaje: string | null;
  alTomarFoto: () => void;
  alElegirFoto: () => void;
  alCompartir: () => void;
  alAbrirAjustes: () => void;
};

// Botones y avisos debajo de la tarjeta (F07). Solo props (§4). Va aparte para que la
// pantalla no pase de ~150 líneas (§6). Los textos no cambian si ya hay foto:
// tocarlos otra vez reemplaza la foto.
export const AccionesTarjeta: FC<PropsAccionesTarjeta> = ({
  permisoCamaraNegado,
  trabajando,
  mensaje,
  alTomarFoto,
  alElegirFoto,
  alCompartir,
  alAbrirAjustes,
}) => {
  // La galería y compartir siguen funcionando con la cámara negada (E2)
  const camaraInactiva = permisoCamaraNegado || trabajando;

  return (
    <View>
      {permisoCamaraNegado && (
        <>
          <Text style={estilos.explicacion}>
            HoopsMap usa la cámara solo para la foto de tu tarjeta. La foto no se guarda.
            Actívala en Ajustes &gt; Expo Go &gt; Cámara.
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            style={estilos.enlace}
            onPress={alAbrirAjustes}
            disabled={trabajando}
          >
            <Text style={estilos.textoBoton}>Abrir Ajustes</Text>
          </TouchableOpacity>
        </>
      )}
      <View style={estilos.fila}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={alTomarFoto}
          disabled={camaraInactiva}
        >
          <Text style={[estilos.textoBoton, camaraInactiva && estilos.textoInactivo]}>
            Tomar foto
          </Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" onPress={alElegirFoto} disabled={trabajando}>
          <Text style={[estilos.textoBoton, trabajando && estilos.textoInactivo]}>
            Elegir de la galería
          </Text>
        </TouchableOpacity>
      </View>
      <BotonPrincipal texto="Compartir" alPresionar={alCompartir} cargando={trabajando} />
      {mensaje !== null && <Text style={estilos.mensaje}>{mensaje}</Text>}
    </View>
  );
};

const estilos = StyleSheet.create({
  explicacion: {
    ...tipografia.pequeno,
    color: colores.textoSecundario,
  },
  enlace: {
    paddingVertical: espaciado.sm,
  },
  // Los dos botones de texto en una fila, con espacio entre ellos
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: espaciado.md,
  },
  textoBoton: {
    ...tipografia.cuerpo,
    color: colores.primario,
  },
  // Un botón de texto deshabilitado se ve gris
  textoInactivo: {
    color: colores.inactivo,
  },
  mensaje: {
    ...tipografia.pequeno,
    color: colores.error,
    marginTop: espaciado.sm,
  },
});
