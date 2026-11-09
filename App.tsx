import { NavigationContainer } from '@react-navigation/native';

import { NavegadorRaiz } from './src/navegacion/NavegadorRaiz';

// Punto de entrada: solo el contenedor de navegación y el Stack raíz
// (coding-standards §2). export default como en la plantilla (§6).
export default function App() {
  return (
    <NavigationContainer>
      <NavegadorRaiz />
    </NavigationContainer>
  );
}
