import type { RefObject } from 'react';
import type { HostInstance } from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

// Único archivo que importa expo-image-picker, react-native-view-shot y expo-sharing (§4).
// Los permisos se piden desde un servicio (§10). Ninguna función llama a
// verificarConexion(): todo pasa en el teléfono (E7 de F07). La foto nunca se guarda.

/**
 * Saca la uri de la foto de lo que devuelve la cámara o la galería.
 * null si el usuario canceló o si no llegó ninguna foto.
 */
function obtenerUriFoto(resultado: ImagePicker.ImagePickerResult): string | null {
  if (resultado.canceled) {
    return null;
  }
  const foto = resultado.assets[0];
  if (foto === undefined) {
    return null;
  }
  return foto.uri;
}

/**
 * Revisa el permiso de cámara sin mostrar el diálogo de iOS.
 * true solo si ya se negó; "aún no se ha preguntado" cuenta como false.
 */
export async function camaraNegada(): Promise<boolean> {
  const { status } = await ImagePicker.getCameraPermissionsAsync();
  return status === 'denied';
}

/**
 * Pide el permiso de cámara. La primera vez iOS muestra el diálogo de Expo Go;
 * después responde sin preguntar. true si el usuario lo dio.
 */
export async function pedirPermisoCamara(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

/**
 * Abre la cámara. Solo fotos y sin recorte (los valores por defecto).
 * @returns la uri de la foto, o null si el usuario canceló
 */
export async function abrirCamara(): Promise<string | null> {
  const resultado = await ImagePicker.launchCameraAsync();
  return obtenerUriFoto(resultado);
}

/**
 * Abre la galería, igual que abrirCamara. En iOS elegir una foto no pide permiso
 * (documentación de Expo SDK 58).
 * @returns la uri de la foto, o null si el usuario canceló
 */
export async function abrirGaleria(): Promise<string | null> {
  const resultado = await ImagePicker.launchImageLibraryAsync();
  return obtenerUriFoto(resultado);
}

/**
 * Convierte la vista en una imagen PNG y abre la hoja de compartir de iOS.
 * La imagen queda en un archivo temporal solo para compartirla: no se sube ni se vuelve a leer.
 * shareAsync no avisa si el usuario compartió o canceló: los dos casos terminan igual.
 * HostInstance y no View: en react-native 0.88 View es una función, y el ref de un
 * <View> apunta a la vista dibujada (HostInstance), que es lo que acepta captureRef.
 * @throws Error('sin-compartir') si el teléfono no puede compartir
 */
export async function compartirImagenDeVista(vista: RefObject<HostInstance | null>): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('sin-compartir');
  }
  const uri = await captureRef(vista, { format: 'png', quality: 1, result: 'tmpfile' });
  await Sharing.shareAsync(uri, { mimeType: 'image/png' });
}
