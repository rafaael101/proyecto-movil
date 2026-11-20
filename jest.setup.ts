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
