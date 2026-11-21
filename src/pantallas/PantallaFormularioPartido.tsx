import type { FC } from 'react';

import { FormularioPartido } from '../componentes/FormularioPartido';
import { VistaCargando } from '../componentes/VistaCargando';
import { VistaError } from '../componentes/VistaError';
import type { PropsPantallaFormularioPartido } from '../navegacion/tipos';
import { useStorePartidos } from '../stores/useStorePartidos';
import { useStoreSesion } from '../stores/useStoreSesion';

// Modal "Nuevo partido" / "Editar partido" (F05, flujos A y B).
// Sin idPartido = crear; con idPartido = editar (01-navigation).
export const PantallaFormularioPartido: FC<PropsPantallaFormularioPartido> = ({
  navigation,
  route,
}) => {
  // Hooks arriba, antes de cualquier return (§6)
  const usuario = useStoreSesion((estado) => estado.usuario);
  const partidos = useStorePartidos((estado) => estado.partidos);
  // "?." porque params es undefined cuando se abre con navigate('FormularioPartido')
  const idPartido = route.params?.idPartido;

  // Sin usuario no hay de quién guardar el partido. Pasa un instante al cerrar
  // sesión con el modal abierto, antes de que desaparezca (E10 de F05)
  if (usuario === null) {
    return <VistaCargando />;
  }

  // Crear
  if (idPartido === undefined) {
    return (
      <FormularioPartido idUsuario={usuario.idUsuario} alTerminar={() => navigation.goBack()} />
    );
  }

  // Editar: el partido se busca en la lista que llena F06. Si no está (se borró en
  // otro teléfono, es ajeno o la lista aún está vacía) no se muestra el formulario
  // vacío (E5 de F05, E2 de 01-navigation)
  const partido = partidos.find((partidoLista) => partidoLista.idPartido === idPartido);
  if (partido === undefined) {
    return (
      <VistaError
        mensaje="Este partido ya no existe"
        textoBoton="Cerrar"
        alPresionarBoton={() => navigation.goBack()}
      />
    );
  }

  return (
    <FormularioPartido
      idUsuario={usuario.idUsuario}
      partido={partido}
      alTerminar={() => navigation.goBack()}
    />
  );
};
