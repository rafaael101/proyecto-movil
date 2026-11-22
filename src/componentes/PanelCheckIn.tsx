import type { FC } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colores, espaciado, radio, tipografia } from '../constantes/tema';
import type { Cancha } from '../tipos/cancha';
import type { CheckIn } from '../tipos/checkIn';
import { buscarCancha } from '../utilidades/canchas';
import { estaActivo, minutosRestantes } from '../utilidades/checkIns';
import { BotonPrincipal } from './BotonPrincipal';

type PropsPanelCheckIn = {
  cancha: Cancha;
  miCheckIn: CheckIn | null;
  permisoNegado: boolean;
  trabajando: boolean; // indicador en el botón; nada se puede tocar
  mensaje: string | null; // error o "Estás a 420 m…"
  alHacerCheckIn: () => void;
  alTerminar: () => void; // "Ya me voy"
  alAbrirAjustes: () => void;
};

// Panel de check-in del detalle de la cancha (F03). Solo props (§4).
// Los minutos se calculan cada vez que se dibuja, sin temporizador (igual que F02)
export const PanelCheckIn: FC<PropsPanelCheckIn> = ({
  cancha,
  miCheckIn,
  permisoNegado,
  trabajando,
  mensaje,
  alHacerCheckIn,
  alTerminar,
  alAbrirAjustes,
}) => {
  const ahora = new Date();
  // Si ya venció, estaActivo da false y vuelve "Hacer check-in" (RN01)
  const activo = miCheckIn !== null && estaActivo(miCheckIn, ahora);
  const estoyAqui = activo && miCheckIn.idCancha === cancha.idCancha;
  const enOtraCancha = activo && miCheckIn.idCancha !== cancha.idCancha;
  const mostrarExplicacion = !estoyAqui && permisoNegado;

  const dibujarContenido = () => {
    if (estoyAqui) {
      return (
        <>
          <Text style={estilos.titulo}>Estás en esta cancha</Text>
          <Text style={estilos.restante}>Te quedan {minutosRestantes(miCheckIn, ahora)} min</Text>
          <BotonPrincipal texto="Ya me voy" alPresionar={alTerminar} cargando={trabajando} />
        </>
      );
    }
    return (
      <>
        {mostrarExplicacion && (
          <>
            <Text style={estilos.explicacion}>
              HoopsMap usa tu ubicación solo para confirmar que estás a 150 m o menos de la
              cancha. No la guarda. Actívala en Ajustes &gt; Expo Go &gt; Ubicación.
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              style={estilos.enlace}
              onPress={alAbrirAjustes}
              disabled={trabajando}
            >
              <Text style={estilos.textoEnlace}>Abrir Ajustes</Text>
            </TouchableOpacity>
          </>
        )}
        {enOtraCancha && (
          // RN03: el check-in anterior se termina al hacer uno nuevo
          <Text style={estilos.aviso}>
            Ahora estás en {buscarCancha(miCheckIn.idCancha)?.nombre ?? 'otra cancha'}. Si haces
            check-in aquí, ese se termina.
          </Text>
        )}
        <BotonPrincipal
          texto="Hacer check-in"
          alPresionar={alHacerCheckIn}
          deshabilitado={permisoNegado}
          cargando={trabajando}
        />
      </>
    );
  };

  return (
    <View style={estilos.panel}>
      {dibujarContenido()}
      {/* Con la explicación del permiso no hace falta otro mensaje */}
      {mensaje !== null && !mostrarExplicacion && <Text style={estilos.mensaje}>{mensaje}</Text>}
    </View>
  );
};

const estilos = StyleSheet.create({
  panel: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderWidth: 1,
    borderRadius: radio,
    padding: espaciado.md,
  },
  titulo: {
    ...tipografia.subtitulo,
    color: colores.texto,
  },
  restante: {
    ...tipografia.cuerpo,
    color: colores.textoSecundario,
    marginBottom: espaciado.md,
  },
  explicacion: {
    ...tipografia.cuerpo,
    color: colores.texto,
  },
  enlace: {
    paddingVertical: espaciado.sm,
    marginBottom: espaciado.sm,
  },
  textoEnlace: {
    ...tipografia.cuerpo,
    color: colores.primario,
  },
  aviso: {
    ...tipografia.pequeno,
    color: colores.texto,
    marginBottom: espaciado.sm,
  },
  mensaje: {
    ...tipografia.pequeno,
    color: colores.error,
    marginTop: espaciado.sm,
  },
});
