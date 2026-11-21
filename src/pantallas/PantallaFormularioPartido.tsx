import type { FC } from 'react';

import { FormularioPartido } from '../componentes/FormularioPartido';
import { VistaCargando } from '../componentes/VistaCargando';
import type { PropsPantallaFormularioPartido } from '../navegacion/tipos';
import { useStoreSesion } from '../stores/useStoreSesion';

// Modal "Nuevo partido" (F05, flujo A). El modo editar llega en F05.5.
export const PantallaFormularioPartido: FC<PropsPantallaFormularioPartido> = ({ navigation }) => {
  const usuario = useStoreSesion((estado) => estado.usuario);

  // Sin usuario no hay de quién guardar el partido. Pasa un instante al cerrar
  // sesión con el modal abierto, antes de que desaparezca (E10 de F05)
  if (usuario === null) {
    return <VistaCargando />;
  }

  return (
    <FormularioPartido idUsuario={usuario.idUsuario} alTerminar={() => navigation.goBack()} />
  );
};
