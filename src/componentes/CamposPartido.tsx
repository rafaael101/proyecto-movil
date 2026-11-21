import type { FC } from 'react';

import { CANCHAS } from '../constantes/canchas';
import type { ErroresPartido, ValoresFormularioPartido } from '../tipos/partido';
import { CampoTexto } from './CampoTexto';
import { CamposMarcador } from './CamposMarcador';
import { SelectorOpciones } from './SelectorOpciones';
import type { OpcionSelector } from './SelectorOpciones';

type PropsCamposPartido = {
  valores: ValoresFormularioPartido;
  errores: ErroresPartido;
  tocados: Partial<Record<keyof ValoresFormularioPartido, boolean>>;
  // Mismo tipo que manejarCambio de useFormulario: K es el campo y
  // ValoresFormularioPartido[K] el tipo de ese campo
  manejarCambio: <K extends keyof ValoresFormularioPartido>(
    campo: K,
  ) => (valor: ValoresFormularioPartido[K]) => void;
  manejarSalida: (campo: keyof ValoresFormularioPartido) => () => void;
  deshabilitado: boolean;
};

// Valor del chip "Sin cancha"; al elegirlo se guarda null (F05)
const SIN_CANCHA = 'sin-cancha';

const OPCIONES_CANCHA: OpcionSelector[] = [
  { valor: SIN_CANCHA, etiqueta: 'Sin cancha' },
  ...CANCHAS.map((cancha) => ({ valor: cancha.idCancha, etiqueta: cancha.nombre })),
];

const OPCIONES_RESULTADO: OpcionSelector[] = [
  { valor: 'gano', etiqueta: 'Ganó' },
  { valor: 'perdio', etiqueta: 'Perdió' },
];

// Campos del formulario de partido (F05). Solo dibuja: el estado, guardar y eliminar
// los maneja FormularioPartido. Va aparte para que ningún componente pase de ~150 líneas (§6).
export const CamposPartido: FC<PropsCamposPartido> = ({
  valores,
  errores,
  tocados,
  manejarCambio,
  manejarSalida,
  deshabilitado,
}) => {
  // El error de un campo se muestra solo si está tocado (como en clase)
  const errorVisible = (campo: keyof ValoresFormularioPartido) =>
    tocados[campo] === true ? errores[campo] : undefined;

  // Fragmento (<>): agrupa los campos sin agregar una vista extra, así se ven igual que antes
  return (
    <>
      <CampoTexto
        etiqueta="Fecha"
        valor={valores.fecha}
        alCambiarTexto={manejarCambio('fecha')}
        alSalir={manejarSalida('fecha')}
        error={errorVisible('fecha')}
        placeholder="AAAA-MM-DD"
        deshabilitado={deshabilitado}
        keyboardType="numbers-and-punctuation"
        autoCorrect={false}
      />
      <SelectorOpciones
        etiqueta="Cancha (opcional)"
        opciones={OPCIONES_CANCHA}
        // null se muestra como "Sin cancha"
        valorSeleccionado={valores.idCancha ?? SIN_CANCHA}
        alSeleccionar={(valor) => manejarCambio('idCancha')(valor === SIN_CANCHA ? null : valor)}
        error={errorVisible('idCancha')}
        deshabilitado={deshabilitado}
      />
      <SelectorOpciones
        etiqueta="Resultado"
        opciones={OPCIONES_RESULTADO}
        valorSeleccionado={valores.resultado}
        // Se convierte sin "as" (§5): el chip solo puede mandar 'gano' o 'perdio'
        alSeleccionar={(valor) => manejarCambio('resultado')(valor === 'gano' ? 'gano' : 'perdio')}
        error={errorVisible('resultado')}
        deshabilitado={deshabilitado}
      />
      <CampoTexto
        etiqueta="Puntos"
        valor={valores.puntos}
        alCambiarTexto={manejarCambio('puntos')}
        alSalir={manejarSalida('puntos')}
        error={errorVisible('puntos')}
        placeholder="Tus puntos"
        deshabilitado={deshabilitado}
        keyboardType="number-pad"
      />
      <CampoTexto
        etiqueta="Rebotes"
        valor={valores.rebotes}
        alCambiarTexto={manejarCambio('rebotes')}
        alSalir={manejarSalida('rebotes')}
        error={errorVisible('rebotes')}
        placeholder="Tus rebotes"
        deshabilitado={deshabilitado}
        keyboardType="number-pad"
      />
      <CampoTexto
        etiqueta="Asistencias"
        valor={valores.asistencias}
        alCambiarTexto={manejarCambio('asistencias')}
        alSalir={manejarSalida('asistencias')}
        error={errorVisible('asistencias')}
        placeholder="Tus asistencias"
        deshabilitado={deshabilitado}
        keyboardType="number-pad"
      />
      <CamposMarcador
        marcadorPropio={valores.marcadorPropio}
        marcadorRival={valores.marcadorRival}
        alCambiarPropio={manejarCambio('marcadorPropio')}
        alCambiarRival={manejarCambio('marcadorRival')}
        // Los dos campos validan con 'marcadorPropio', porque ahí vive el error del marcador
        alSalir={manejarSalida('marcadorPropio')}
        error={
          tocados.marcadorPropio === true || tocados.marcadorRival === true
            ? errores.marcadorPropio
            : undefined
        }
        deshabilitado={deshabilitado}
      />
    </>
  );
};
