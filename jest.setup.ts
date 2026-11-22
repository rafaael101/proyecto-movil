// En las pruebas no hay teléfono: AsyncStorage se reemplaza por el simulador
// oficial, que guarda los datos en memoria (coding-standards §12).
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Ionicons carga expo-font, que pide expo-asset; npm lo dejó dentro de
// node_modules/expo/node_modules (no en la raíz) y Jest no lo encuentra.
// En el iPhone no pasa. Los tests no revisan iconos: se reemplaza por un
// componente que no dibuja nada. Lo usan los tests que dibujan NavegadorRaiz.
jest.mock('@expo/vector-icons/Ionicons', () => () => null);

// El mapa es nativo y no existe en las pruebas: MapView (default) y Marker se
// reemplazan por un View normal, así se dibujan sus hijos sin el mapa (F02).
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: View, Marker: View };
});

// NetInfo con su simulador oficial: responde que sí hay internet (F02)
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);

// Cámara, galería, captura y compartir son nativos y no existen en las pruebas (F07).
// Se simulan con fábrica para que los tests que dibujan NavegadorRaiz no los carguen.
// El permiso de cámara responde "aún no se ha preguntado", como recién instalada la app.
jest.mock('expo-image-picker', () => ({
  getCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'undetermined' })),
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));
