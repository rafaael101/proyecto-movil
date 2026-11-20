import { useState } from 'react';
import type { FC } from 'react';
import { StyleSheet, Text } from 'react-native';

import { BotonPrincipal } from '../componentes/BotonPrincipal';
import { CampoTexto } from '../componentes/CampoTexto';
import { ContenedorSesion } from '../componentes/ContenedorSesion';
import { colores, espaciado, tipografia } from '../constantes/tema';
import { useFormulario } from '../hooks/useFormulario';
import type { PropsPantallaRegistro } from '../navegacion/tipos';
import { useStoreSesion } from '../stores/useStoreSesion';
import type { ValoresRegistro } from '../tipos/usuario';
import { validarRegistro } from '../utilidades/validacionesUsuario';

// Pantalla "Crear cuenta" (F01, flujo B)
export const PantallaRegistro: FC<PropsPantallaRegistro> = ({ navigation }) => {
  // Su propio error del servidor: no ve el de "Iniciar sesión" (E17)
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const registrarse = useStoreSesion((estado) => estado.registrarse);

  const formulario = useFormulario<ValoresRegistro>({
    valoresIniciales: { nombre: '', correo: '', contrasena: '' },
    validar: validarRegistro,
    alEnviar: async (valores) => {
      setErrorServidor(null);
      const mensaje = await registrarse(valores);
      setErrorServidor(mensaje); // null si se creó: la navegación cambia sola a Mapa
    },
  });

  return (
    // "Ya tengo cuenta" regresa a "Iniciar sesión", que sigue abajo en el Stack
    <ContenedorSesion textoEnlace="Ya tengo cuenta" alPresionarEnlace={() => navigation.goBack()}>
      {/* El error de cada campo se pasa solo si está tocado (como en clase) */}
      <CampoTexto
        etiqueta="Nombre"
        valor={formulario.valores.nombre}
        alCambiarTexto={formulario.manejarCambio('nombre')}
        alSalir={formulario.manejarSalida('nombre')}
        error={formulario.tocados.nombre === true ? formulario.errores.nombre : undefined}
        placeholder="Tu nombre"
        deshabilitado={formulario.enviando}
        autoCapitalize="words"
      />
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
        placeholder="Mínimo 6 caracteres y un número"
        deshabilitado={formulario.enviando}
        secureTextEntry
      />
      {errorServidor !== null && <Text style={estilos.errorServidor}>{errorServidor}</Text>}
      <BotonPrincipal
        texto="Crear cuenta"
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
