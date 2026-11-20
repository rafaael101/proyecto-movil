import type { FC, ReactNode } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { colores, espaciado, tipografia } from '../constantes/tema';

type PropsContenedorSesion = {
  children: ReactNode; // campos, error del servidor y botón de la pantalla
  textoEnlace: string; // "Crear cuenta" o "Ya tengo cuenta"
  alPresionarEnlace: () => void;
};

// Estructura común de Inicio de sesión y Registro (F01). Es un componente porque
// la misma pieza aparece en dos pantallas (coding-standards §6).
export const ContenedorSesion: FC<PropsContenedorSesion> = ({
  children,
  textoEnlace,
  alPresionarEnlace,
}) => {
  return (
    // Como en la clase "TextInput y Teclado": en iPhone el contenido sube con
    // padding para que el teclado no tape los campos
    <KeyboardAvoidingView
      style={estilos.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Tocar fuera de los campos cierra el teclado (F01-CA08).
          accessible={false}: si no, VoiceOver leería toda la pantalla como un solo elemento */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={estilos.contenido}>
          <Text style={estilos.titulo}>HoopsMap</Text>
          {children}
          <TouchableOpacity style={estilos.enlace} onPress={alPresionarEnlace}>
            <Text style={estilos.textoEnlace}>{textoEnlace}</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    flex: 1,
    justifyContent: 'center',
    padding: espaciado.lg,
  },
  titulo: {
    ...tipografia.titulo,
    color: colores.texto,
    textAlign: 'center',
    marginBottom: espaciado.xl,
  },
  enlace: {
    alignItems: 'center',
    marginTop: espaciado.md,
  },
  textoEnlace: {
    ...tipografia.cuerpo,
    color: colores.primario,
  },
});
