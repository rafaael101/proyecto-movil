import { useState } from 'react';
import type { FC } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import { colores, espaciado, tipografia } from '../constantes/tema';
import { useFormulario } from '../hooks/useFormulario';
import { useStorePartidos } from '../stores/useStorePartidos';
import type { Partido, ValoresFormularioPartido } from '../tipos/partido';
import { obtenerFechaHoy } from '../utilidades/fechas';
import {
  convertirAPartido,
  convertirAValores,
  crearValoresVacios,
  validarPartido,
} from '../utilidades/validacionesPartido';
import { BotonPrincipal } from './BotonPrincipal';
import { CamposPartido } from './CamposPartido';

type PropsFormularioPartido = {
  idUsuario: string;
  partido?: Partido; // undefined = crear
  alTerminar: () => void; // navigation.goBack: cierra el modal
};

// Formulario de partido (F05). Excepción a coding-standards §4: es un componente que usa
// useFormulario y el store, porque así lo define F05. Va aparte de la pantalla por la
// regla de los hooks: la pantalla puede regresar otra vista antes de llegar a useFormulario.
// Los campos los dibuja CamposPartido; aquí quedan el estado, guardar, eliminar y los botones.
export const FormularioPartido: FC<PropsFormularioPartido> = ({
  idUsuario,
  partido,
  alTerminar,
}) => {
  // Error de Firebase o de conexión: solo lo muestra este modal (F05, Diseño)
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const registrarPartido = useStorePartidos((estado) => estado.registrarPartido);
  const actualizarPartido = useStorePartidos((estado) => estado.actualizarPartido);
  const borrarPartido = useStorePartidos((estado) => estado.borrarPartido);
  // Como enviando, pero para eliminar: deshabilita todo mientras se borra (F05, flujo C)
  const [eliminando, setEliminando] = useState(false);

  const formulario = useFormulario<ValoresFormularioPartido>({
    // Crear: fecha de hoy y lo demás vacío. Editar: los datos del partido guardado
    valoresIniciales:
      partido === undefined
        ? crearValoresVacios(obtenerFechaHoy(new Date()))
        : convertirAValores(partido),
    // hoy se calcula al validar y se pasa como parámetro: validarPartido sigue siendo pura (RN09)
    validar: (valores) => validarPartido(valores, obtenerFechaHoy(new Date())),
    alEnviar: async (valores) => {
      setErrorServidor(null);
      const datos = convertirAPartido(valores);
      const mensaje =
        partido === undefined
          ? await registrarPartido(idUsuario, datos)
          : await actualizarPartido(idUsuario, partido.idPartido, datos);
      if (mensaje === null) {
        alTerminar(); // se guardó: cierra el modal
      } else {
        setErrorServidor(mensaje); // falló: arriba de "Guardar"; lo escrito se conserva
      }
    },
  });

  // Mientras guarda o elimina no se puede tocar nada: evita un doble envío (E8 de F05)
  const ocupado = formulario.enviando || eliminando;

  // "Eliminar" de la alerta: borra el partido y cierra el modal si salió bien
  const eliminar = async (idPartido: string) => {
    setErrorServidor(null);
    setEliminando(true);
    const mensaje = await borrarPartido(idUsuario, idPartido);
    if (mensaje === null) {
      alTerminar();
    } else {
      setErrorServidor(mensaje); // arriba de "Guardar", igual que al guardar
      setEliminando(false);
    }
  };

  // Pide confirmar antes de borrar, porque no se puede deshacer (F05, flujo C)
  const confirmarEliminar = (idPartido: string) => {
    Alert.alert('¿Eliminar este partido?', 'No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(idPartido) },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={estilos.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* "handled": tocar un chip con el teclado abierto sí lo marca, no solo cierra el teclado */}
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <CamposPartido
          valores={formulario.valores}
          errores={formulario.errores}
          tocados={formulario.tocados}
          manejarCambio={formulario.manejarCambio}
          manejarSalida={formulario.manejarSalida}
          deshabilitado={ocupado}
        />
        {errorServidor !== null && <Text style={estilos.errorServidor}>{errorServidor}</Text>}
        <BotonPrincipal
          texto="Guardar"
          alPresionar={formulario.manejarEnvio}
          deshabilitado={eliminando}
          cargando={formulario.enviando}
        />
        {/* Solo en editar: en "Nuevo partido" no hay nada que borrar */}
        {partido !== undefined && (
          <TouchableOpacity
            style={estilos.botonEliminar}
            onPress={() => confirmarEliminar(partido.idPartido)}
            disabled={ocupado}
          >
            <Text style={estilos.textoEliminar}>Eliminar partido</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: espaciado.lg,
  },
  // Error del servidor arriba de "Guardar" (igual que F01)
  errorServidor: {
    ...tipografia.pequeno,
    color: colores.error,
    marginBottom: espaciado.sm,
  },
  // Botón de texto rojo, centrado, debajo de "Guardar" (F05, Diseño)
  botonEliminar: {
    alignItems: 'center',
    marginTop: espaciado.md,
  },
  textoEliminar: {
    ...tipografia.cuerpo,
    color: colores.error,
  },
});
