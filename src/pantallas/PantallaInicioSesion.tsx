import { useState } from 'react';
import type { FC } from 'react';
import { StyleSheet, Text } from 'react-native';

import { BotonPrincipal } from '../componentes/BotonPrincipal';
import { CampoTexto } from '../componentes/CampoTexto';
import { ContenedorSesion } from '../componentes/ContenedorSesion';
import { colores, espaciado, tipografia } from '../constantes/tema';
import { useFormulario } from '../hooks/useFormulario';
import type { PropsPantallaInicioSesion } from '../navegacion/tipos';
import { useStoreSesion } from '../stores/useStoreSesion';
import type { ValoresInicioSesion } from '../tipos/usuario';
import { validarInicioSesion } from '../utilidades/validacionesUsuario';

// Pantalla "Iniciar sesión" (F01, flujo C)
export const PantallaInicioSesion: FC<PropsPantallaInicioSesion> = ({ navigation }) => {
  // El error del servidor solo lo usa esta pantalla: useState y no el store (E17)
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const iniciarSesion = useStoreSesion((estado) => estado.iniciarSesion);

  const formulario = useFormulario<ValoresInicioSesion>({
    valoresIniciales: { correo: '', contrasena: '' },
    validar: validarInicioSesion,
    alEnviar: async (valores) => {
      setErrorServidor(null);
      const mensaje = await iniciarSesion(valores);
      setErrorServidor(mensaje); // null si entró: la navegación cambia sola
    },
  });

  return (
    <ContenedorSesion
      textoEnlace="Crear cuenta"
      alPresionarEnlace={() => navigation.navigate('Registro')}
    >
      {/* El error de cada campo se pasa solo si está tocado (como en clase) */}
      <CampoTexto
        etiqueta="Correo"
        valor={formulario.valores.correo}
        alCambiarTexto={formulario.manejarCambio('correo')}
        alSalir={formulario.manejarSalida('correo')}
        error={formulario.tocados.correo === true ? formulario.errores.correo : undefined}
        placeholder="tu@correo.com"
        deshabilitado={formulario.enviando}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <CampoTexto
        etiqueta="Contraseña"
        valor={formulario.valores.contrasena}
        alCambiarTexto={formulario.manejarCambio('contrasena')}
        alSalir={formulario.manejarSalida('contrasena')}
        error={formulario.tocados.contrasena === true ? formulario.errores.contrasena : undefined}
        placeholder="Tu contraseña"
        deshabilitado={formulario.enviando}
        secureTextEntry
      />
      {errorServidor !== null && <Text style={estilos.errorServidor}>{errorServidor}</Text>}
      <BotonPrincipal
        texto="Iniciar sesión"
        alPresionar={formulario.manejarEnvio}
        cargando={formulario.enviando}
      />
    </ContenedorSesion>
  );
};

const estilos = StyleSheet.create({
  // Error del servidor arriba del botón (F01, Estructura común)
  errorServidor: {
    ...tipografia.pequeno,
    color: colores.error,
    marginBottom: espaciado.sm,
  },
});
