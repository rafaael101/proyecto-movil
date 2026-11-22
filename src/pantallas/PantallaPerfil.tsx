import { useEffect } from 'react';
import type { FC } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { BotonPrincipal } from '../componentes/BotonPrincipal';
import { ResumenPromedios } from '../componentes/ResumenPromedios';
import { VistaCargando } from '../componentes/VistaCargando';
import { colores, espaciado, tipografia } from '../constantes/tema';
import type { PropsPantallaPerfil } from '../navegacion/tipos';
import { useStorePartidos } from '../stores/useStorePartidos';
import { useStoreSesion } from '../stores/useStoreSesion';
import { obtenerNombreVisible } from '../utilidades/usuario';

// Pantalla "Mi perfil": nombre, correo y cerrar sesión (F01), con los promedios
// en medio (F06)
export const PantallaPerfil: FC<PropsPantallaPerfil> = () => {
  const usuario = useStoreSesion((estado) => estado.usuario);
  const cerrandoSesion = useStoreSesion((estado) => estado.cerrandoSesion);
  const cerrarSesion = useStoreSesion((estado) => estado.cerrarSesion);
  const promedios = useStorePartidos((estado) => estado.promedios);
  const cargando = useStorePartidos((estado) => estado.cargando);
  const mensajeError = useStorePartidos((estado) => estado.mensajeError);
  const guardadoEn = useStorePartidos((estado) => estado.guardadoEn);
  const cargarHistorial = useStorePartidos((estado) => estado.cargarHistorial);
  const idUsuario = usuario?.idUsuario;

  // Igual que Historial: carga solo si todavía no hay nada (F06, flujo A)
  useEffect(() => {
    if (idUsuario !== undefined && promedios === null) {
      cargarHistorial(idUsuario);
    }
  }, [idUsuario, promedios, cargarHistorial]);

  // Pide confirmación antes de cerrar sesión (01-navigation, Al cerrar sesión).
  // Sin navigate: al quedar el store sin usuario, aparece "Iniciar sesión" solo.
  const manejarCerrarSesion = () => {
    Alert.alert('¿Seguro que quieres cerrar sesión?', undefined, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive', // en rojo en iPhone
        onPress: async () => {
          const mensaje = await cerrarSesion();
          // Si signOut falla, sigue en Perfil con sesión y se avisa (E15)
          if (mensaje !== null) {
            Alert.alert(mensaje);
          }
        },
      },
    ]);
  };

  // Solo pasa un instante al cerrar sesión, antes de que desaparezca la pantalla (F01)
  if (usuario === null) {
    return <VistaCargando />;
  }

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.nombre}>{obtenerNombreVisible(usuario.nombre)}</Text>
      <Text style={estilos.correo}>{usuario.correo}</Text>
      <ResumenPromedios
        promedios={promedios}
        cargando={cargando}
        mensajeError={mensajeError}
        guardadoEn={guardadoEn}
        alReintentar={() => cargarHistorial(usuario.idUsuario)}
      />
      <View style={estilos.contenedorBoton}>
        {/* Deshabilitado con indicador mientras cierra: evita el doble toque (E16) */}
        <BotonPrincipal
          texto="Cerrar sesión"
          alPresionar={manejarCerrarSesion}
          cargando={cerrandoSesion}
        />
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    padding: espaciado.lg,
    backgroundColor: colores.fondo,
  },
  nombre: {
    ...tipografia.subtitulo,
    color: colores.texto,
  },
  correo: {
    ...tipografia.cuerpo,
    color: colores.textoSecundario,
    marginTop: espaciado.xs,
  },
  contenedorBoton: {
    marginTop: espaciado.xl,
  },
});
