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

import { CANCHAS } from '../constantes/canchas';
import { colores, espaciado, tipografia } from '../constantes/tema';
import { useFormulario } from '../hooks/useFormulario';
import { useStorePartidos } from '../stores/useStorePartidos';
import type { Partido, ValoresFormularioPartido } from '../tipos/partido';
import { obtenerFechaHoy } from '../utilidades/fechas';
import {
  convertirAPartido,
  convertirAValores,
  validarPartido,
} from '../utilidades/validacionesPartido';
import { BotonPrincipal } from './BotonPrincipal';
import { CampoTexto } from './CampoTexto';
import { CamposMarcador } from './CamposMarcador';
import { SelectorOpciones } from './SelectorOpciones';
import type { OpcionSelector } from './SelectorOpciones';

type PropsFormularioPartido = {
  idUsuario: string;
  partido?: Partido; // undefined = crear
  alTerminar: () => void; // navigation.goBack: cierra el modal
};

// Valor del chip "Sin cancha"; al elegirlo se guarda null (F05)
const SIN_CANCHA = 'sin-cancha';

const OPCIONES_CANCHA: OpcionSelector[] = [
  { valor: SIN_CANCHA, etiqueta: 'Sin cancha' },
  ...CANCHAS.map((cancha) => ({ valor: cancha.idCancha, etiqueta: cancha.nombre })),
];

const OPCIONES_RESULTADO: OpcionSelector[] = [
  { valor: 'gano', etiqueta: 'Ganó' },
  { valor: 'perdio', etiqueta: 'Perdió' },
];

// Formulario de partido (F05). Excepción a coding-standards §4: es un componente que usa
// useFormulario y el store, porque así lo define F05. Va aparte de la pantalla por la
// regla de los hooks: la pantalla puede regresar otra vista antes de llegar a useFormulario.
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
        ? {
            fecha: obtenerFechaHoy(new Date()),
            idCancha: null, // "Sin cancha"
            resultado: null, // ninguno
            puntos: '',
            rebotes: '',
            asistencias: '',
            marcadorPropio: '',
            marcadorRival: '',
          }
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

  const { valores, errores, tocados, enviando } = formulario;
  // Mientras guarda o elimina no se puede tocar nada: evita un doble envío (E8 de F05)
  const ocupado = enviando || eliminando;

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
  // El error de un campo se muestra solo si está tocado (como en clase)
  const errorVisible = (campo: keyof ValoresFormularioPartido) =>
    tocados[campo] === true ? errores[campo] : undefined;

  return (
    <KeyboardAvoidingView
      style={estilos.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* "handled": tocar un chip con el teclado abierto sí lo marca, no solo cierra el teclado */}
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <CampoTexto
          etiqueta="Fecha"
          valor={valores.fecha}
          alCambiarTexto={formulario.manejarCambio('fecha')}
          alSalir={formulario.manejarSalida('fecha')}
          error={errorVisible('fecha')}
          placeholder="AAAA-MM-DD"
          deshabilitado={ocupado}
          keyboardType="numbers-and-punctuation"
          autoCorrect={false}
        />
        <SelectorOpciones
          etiqueta="Cancha (opcional)"
          opciones={OPCIONES_CANCHA}
          // null se muestra como "Sin cancha"
          valorSeleccionado={valores.idCancha ?? SIN_CANCHA}
          alSeleccionar={(valor) =>
            formulario.manejarCambio('idCancha')(valor === SIN_CANCHA ? null : valor)
          }
          error={errorVisible('idCancha')}
          deshabilitado={ocupado}
        />
        <SelectorOpciones
          etiqueta="Resultado"
          opciones={OPCIONES_RESULTADO}
          valorSeleccionado={valores.resultado}
          // Se convierte sin "as" (§5): el chip solo puede mandar 'gano' o 'perdio'
          alSeleccionar={(valor) =>
            formulario.manejarCambio('resultado')(valor === 'gano' ? 'gano' : 'perdio')
          }
          error={errorVisible('resultado')}
          deshabilitado={ocupado}
        />
        <CampoTexto
          etiqueta="Puntos"
          valor={valores.puntos}
          alCambiarTexto={formulario.manejarCambio('puntos')}
          alSalir={formulario.manejarSalida('puntos')}
          error={errorVisible('puntos')}
          placeholder="Tus puntos"
          deshabilitado={ocupado}
          keyboardType="number-pad"
        />
        <CampoTexto
          etiqueta="Rebotes"
          valor={valores.rebotes}
          alCambiarTexto={formulario.manejarCambio('rebotes')}
          alSalir={formulario.manejarSalida('rebotes')}
          error={errorVisible('rebotes')}
          placeholder="Tus rebotes"
          deshabilitado={ocupado}
          keyboardType="number-pad"
        />
        <CampoTexto
          etiqueta="Asistencias"
          valor={valores.asistencias}
          alCambiarTexto={formulario.manejarCambio('asistencias')}
          alSalir={formulario.manejarSalida('asistencias')}
          error={errorVisible('asistencias')}
          placeholder="Tus asistencias"
          deshabilitado={ocupado}
          keyboardType="number-pad"
        />
        <CamposMarcador
          marcadorPropio={valores.marcadorPropio}
          marcadorRival={valores.marcadorRival}
          alCambiarPropio={formulario.manejarCambio('marcadorPropio')}
          alCambiarRival={formulario.manejarCambio('marcadorRival')}
          // Los dos campos validan con 'marcadorPropio', porque ahí vive el error del marcador
          alSalir={formulario.manejarSalida('marcadorPropio')}
          error={
            tocados.marcadorPropio === true || tocados.marcadorRival === true
              ? errores.marcadorPropio
              : undefined
          }
          deshabilitado={ocupado}
        />
        {errorServidor !== null && <Text style={estilos.errorServidor}>{errorServidor}</Text>}
        <BotonPrincipal
          texto="Guardar"
          alPresionar={formulario.manejarEnvio}
          deshabilitado={eliminando}
          cargando={enviando}
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
