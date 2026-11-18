import NetInfo from '@react-native-community/netinfo';

/**
 * Revisa una vez si el teléfono tiene internet (clase Offline, RN11).
 * Devuelve false solo si NetInfo está seguro de que no hay conexión.
 * Si isInternetReachable es null ("aún no sé"), se intenta igual.
 */
export async function hayConexion(): Promise<boolean> {
  const estado = await NetInfo.fetch();
  if (estado.isConnected === false || estado.isInternetReachable === false) {
    return false;
  }
  return true;
}

/**
 * Se llama antes de hablar con Firebase para no dejar un spinner eterno (E1).
 * @throws Error('sin-conexion') si no hay internet
 */
export async function verificarConexion(): Promise<void> {
  const conectado = await hayConexion();
  if (!conectado) {
    throw new Error('sin-conexion');
  }
}
