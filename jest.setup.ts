// En las pruebas no hay teléfono: AsyncStorage se reemplaza por el simulador
// oficial, que guarda los datos en memoria (coding-standards §12).
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
