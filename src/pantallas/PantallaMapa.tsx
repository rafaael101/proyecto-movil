import { useEffect, useLayoutEffect } from 'react';
import type { FC } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { useNetInfo } from '@react-native-community/netinfo';
import MapView from 'react-native-maps';

import { AvisoMapa } from '../componentes/AvisoMapa';
import { MarcadorCancha } from '../componentes/MarcadorCancha';
import { VistaCargando } from '../componentes/VistaCargando';
import { CANCHAS } from '../constantes/canchas';
import { REGION_INICIAL } from '../constantes/configuracion';
import { colores, espaciado, tamanoIcono } from '../constantes/tema';
import type { PropsPantallaMapa } from '../navegacion/tipos';
import { useStoreCheckIns } from '../stores/useStoreCheckIns';
import { useStoreSesion } from '../stores/useStoreSesion';

// Tab "Canchas cercanas" (F02): las canchas del catálogo con cuántos juegan en cada una.
// El mapa nunca se cambia por VistaError ni VistaVacia: las canchas son locales (RN05).
// Sin datos confiables las burbujas dicen "?", nunca un "0" falso (§9).
export const PantallaMapa: FC<PropsPantallaMapa> = ({ navigation }) => {
  const usuario = useStoreSesion((estado) => estado.usuario);
  const resumen = useStoreCheckIns((estado) => estado.resumen);
  const cargando = useStoreCheckIns((estado) => estado.cargando);
  const mensajeError = useStoreCheckIns((estado) => estado.mensajeError);
  const cargarResumen = useStoreCheckIns((estado) => estado.cargarResumen);
  // Excepción 3 de §4: useNetInfo solo para el aviso. Con null ("aún no sé") se intenta,
  // igual que hayConexion (02-data-model)
  const { isConnected, isInternetReachable } = useNetInfo();
  const sinConexion = isConnected === false || isInternetReachable === false;
  // "?." porque usuario es null un instante al cerrar sesión
  const idUsuario = usuario?.idUsuario;

  // Carga al montarse o si cambia el usuario; no al volver a la tab (E11 de 01-navigation)
  useEffect(() => {
    if (idUsuario !== undefined) {
      cargarResumen(idUsuario);
    }
  }, [idUsuario, cargarResumen]);

  // "Actualizar" en el header, igual que el [+] de Historial. Deshabilitado mientras carga
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          accessibilityLabel="Actualizar"
          disabled={cargando}
          onPress={() => {
            if (idUsuario !== undefined) {
              cargarResumen(idUsuario);
            }
          }}
        >
          <Ionicons
            name="refresh"
            size={tamanoIcono}
            color={cargando ? colores.inactivo : colores.primario}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, cargando, idUsuario, cargarResumen]);

  if (usuario === null) {
    return <VistaCargando />;
  }

  const recargar = () => cargarResumen(usuario.idUsuario);

  // Número de una cancha, o null ("?") si el conteo no es confiable.
  // Una cancha que no aparece en jugadoresPorCancha tiene 0 (02-data-model)
  const obtenerJugadores = (idCancha: string): number | null => {
    if (sinConexion || mensajeError !== null || resumen === null) {
      return null;
    }
    return resumen.jugadoresPorCancha[idCancha] ?? 0;
  };

  // Lo que va arriba del mapa: un solo elemento a la vez, en el orden de F02
  const dibujarAviso = () => {
    if (sinConexion) {
      return (
        <AvisoMapa
          mensaje="Sin conexión: no podemos ver quién está jugando."
          alPresionarBoton={recargar}
        />
      );
    }
    if (cargando) {
      return <ActivityIndicator style={estilos.indicador} color={colores.primario} />;
    }
    if (mensajeError !== null) {
      return <AvisoMapa mensaje={mensajeError} alPresionarBoton={recargar} />;
    }
    if (resumen !== null && Object.keys(resumen.jugadoresPorCancha).length === 0) {
      return <AvisoMapa mensaje="Nadie está jugando ahora. Sé el primero en hacer check-in." />;
    }
    return null;
  };

  return (
    <View style={estilos.contenedor}>
      {/* Región fija de Ensenada: sin GPS y sin punto azul (F02) */}
      <MapView style={estilos.mapa} initialRegion={REGION_INICIAL}>
        {CANCHAS.map((cancha) => (
          <MarcadorCancha
            key={cancha.idCancha}
            cancha={cancha}
            jugadores={obtenerJugadores(cancha.idCancha)}
            // navigate y no push: un doble toque abre un solo detalle (E10 de 01-navigation)
            alPresionar={(idCancha) => navigation.navigate('DetalleCancha', { idCancha })}
          />
        ))}
      </MapView>
      {dibujarAviso()}
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  mapa: {
    flex: 1,
  },
  // Arriba al centro, encima del mapa
  indicador: {
    position: 'absolute',
    top: espaciado.md,
    left: 0,
    right: 0,
  },
});
