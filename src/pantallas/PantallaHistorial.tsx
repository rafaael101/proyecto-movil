import type { FC } from 'react';
import { useEffect, useLayoutEffect } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { AvisoSinConexion } from '../componentes/AvisoSinConexion';
import { FilaPartido } from '../componentes/FilaPartido';
import { VistaCargando } from '../componentes/VistaCargando';
import { VistaError } from '../componentes/VistaError';
import { VistaVacia } from '../componentes/VistaVacia';
import { colores, espaciado, tamanoIcono, tipografia } from '../constantes/tema';
import type { PropsPantallaHistorial } from '../navegacion/tipos';
import { useStorePartidos } from '../stores/useStorePartidos';
import { useStoreSesion } from '../stores/useStoreSesion';

// Tab "Mis partidos" (F06): lista paginada con infinite scroll y caché sin conexión (RN11)
export const PantallaHistorial: FC<PropsPantallaHistorial> = ({ navigation }) => {
  const usuario = useStoreSesion((estado) => estado.usuario);
  const partidos = useStorePartidos((estado) => estado.partidos);
  const promedios = useStorePartidos((estado) => estado.promedios);
  const cargando = useStorePartidos((estado) => estado.cargando);
  const cargandoMas = useStorePartidos((estado) => estado.cargandoMas);
  const mensajeError = useStorePartidos((estado) => estado.mensajeError);
  const mensajeErrorMas = useStorePartidos((estado) => estado.mensajeErrorMas);
  const guardadoEn = useStorePartidos((estado) => estado.guardadoEn);
  const cargarHistorial = useStorePartidos((estado) => estado.cargarHistorial);
  const cargarMas = useStorePartidos((estado) => estado.cargarMas);
  // "?." porque usuario es null un instante al cerrar sesión
  const idUsuario = usuario?.idUsuario;

  // El [+] va aquí y no en NavegadorTabs: allá navigation no conoce FormularioPartido
  // (CompositeScreenProps, tipos.ts). useLayoutEffect: cambia el header antes de dibujar.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        // accessibilityLabel: el botón solo tiene un icono; así VoiceOver lo lee
        <TouchableOpacity
          accessibilityLabel="Nuevo partido"
          onPress={() => navigation.navigate('FormularioPartido')}
        >
          <Ionicons name="add" size={tamanoIcono} color={colores.primario} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Carga solo si todavía no hay nada (promedios === null): así no importa si se abre
  // primero Historial o Perfil, y no se recarga al cambiar de tab (CA12 de 01-navigation)
  useEffect(() => {
    if (idUsuario !== undefined && promedios === null) {
      cargarHistorial(idUsuario);
    }
  }, [idUsuario, promedios, cargarHistorial]);

  // Estados en el orden de §9: cargando → error → vacío → datos
  if (usuario === null || cargando) {
    return <VistaCargando />;
  }
  const recargar = () => cargarHistorial(usuario.idUsuario);
  if (mensajeError !== null) {
    return <VistaError mensaje={mensajeError} alPresionarBoton={recargar} />;
  }

  // Si se está viendo la caché, el aviso va arriba (en vacío y en datos)
  const aviso =
    guardadoEn !== null ? (
      <View style={estilos.contenedorAviso}>
        <AvisoSinConexion guardadoEn={guardadoEn} alReintentar={recargar} />
      </View>
    ) : null;

  if (partidos.length === 0) {
    return (
      <View style={estilos.contenedor}>
        {aviso}
        <VistaVacia mensaje="Aún no registras partidos" />
      </View>
    );
  }

  // Pie de la lista: cargando la siguiente página, su error o nada.
  // Nada = undefined, porque ListFooterComponent no acepta null en sus tipos
  const dibujarPie = () => {
    if (cargandoMas) {
      return <ActivityIndicator style={estilos.pie} color={colores.primario} />;
    }
    if (mensajeErrorMas !== null) {
      return (
        <View style={estilos.pie}>
          <Text style={estilos.errorPie}>{mensajeErrorMas}</Text>
          <TouchableOpacity onPress={() => cargarMas(usuario.idUsuario)}>
            <Text style={estilos.reintentar}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return undefined;
  };

  return (
    <View style={estilos.contenedor}>
      {aviso}
      {/* FlatList como en la clase "FlatList Avanzado": al acercarse al final pide más */}
      <FlatList
        data={partidos}
        keyExtractor={(partido) => partido.idPartido}
        renderItem={({ item }) => (
          <FilaPartido
            partido={item}
            alPresionar={(idPartido) => navigation.navigate('FormularioPartido', { idPartido })}
            alPresionarTarjeta={(idPartido) =>
              navigation.navigate('TarjetaJugador', { idPartido })
            }
          />
        )}
        onEndReached={() => cargarMas(usuario.idUsuario)}
        onEndReachedThreshold={0.5}
        ListFooterComponent={dibujarPie()}
        contentContainerStyle={estilos.lista}
      />
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenedorAviso: {
    paddingHorizontal: espaciado.md,
    paddingTop: espaciado.md,
  },
  lista: {
    padding: espaciado.md,
  },
  pie: {
    alignItems: 'center',
    paddingVertical: espaciado.md,
  },
  errorPie: {
    ...tipografia.pequeno,
    color: colores.error,
    textAlign: 'center',
  },
  reintentar: {
    ...tipografia.cuerpo,
    color: colores.primario,
    marginTop: espaciado.xs,
  },
});
