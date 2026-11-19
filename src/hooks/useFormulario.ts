import { useState } from 'react';

// Partial<Record<keyof T, string>> = "un objeto con los mismos nombres de campo que T,
// donde cada uno es un texto y todos son opcionales" (un mensaje solo si hay error).
// Record<keyof T, boolean> = lo mismo, pero con true/false.
// T[K] = "el tipo del campo K dentro de T". Así no hace falta any (la clase usa value: any).
type ErroresFormulario<T> = Partial<Record<keyof T, string>>;
type TocadosFormulario<T> = Partial<Record<keyof T, boolean>>;

type OpcionesFormulario<T> = {
  valoresIniciales: T;
  validar: (valores: T) => ErroresFormulario<T>;
  alEnviar: (valores: T) => Promise<void>;
};

// Es el useForm de la clase "Custom Hook de Formulario" con nombres en español
// y sin any (coding-standards §11)
export function useFormulario<T extends object>({
  valoresIniciales,
  validar,
  alEnviar,
}: OpcionesFormulario<T>) {
  const [valores, setValores] = useState<T>(valoresIniciales);
  const [errores, setErrores] = useState<ErroresFormulario<T>>({});
  const [tocados, setTocados] = useState<TocadosFormulario<T>>({});
  const [enviando, setEnviando] = useState(false);

  // Para onChangeText: guarda el valor y, si ese campo tenía error, borra solo ese error.
  // No valida: eso pasa al salir del campo o al enviar.
  const manejarCambio =
    <K extends keyof T>(campo: K) =>
    (valor: T[K]) => {
      setValores({ ...valores, [campo]: valor });
      if (errores[campo] !== undefined) {
        setErrores({ ...errores, [campo]: undefined });
      }
    };

  // Para onBlur: marca el campo como tocado y valida, pero solo aplica el error de ese campo
  const manejarSalida = (campo: keyof T) => () => {
    setTocados({ ...tocados, [campo]: true });
    const erroresNuevos = validar(valores);
    setErrores({ ...errores, [campo]: erroresNuevos[campo] });
  };

  // Para el botón: marca todo como tocado, valida y, si no hay errores, llama a alEnviar.
  // No revisa enviando: el doble toque lo evita la pantalla deshabilitando botón y campos.
  const manejarEnvio = async () => {
    const todosTocados: TocadosFormulario<T> = {};
    // Diferencia con la clase: allá se usa Object.keys, pero devuelve string[] y aquí
    // necesitaría un "as" (§5 no lo permite). for...in recorre los mismos campos y
    // TypeScript sí sabe que cada uno es un campo de T.
    for (const campo in valores) {
      todosTocados[campo] = true;
    }
    setTocados(todosTocados);

    const erroresNuevos = validar(valores);
    setErrores(erroresNuevos);
    if (Object.keys(erroresNuevos).length > 0) {
      return;
    }

    setEnviando(true);
    try {
      await alEnviar(valores);
    } catch (error) {
      console.error('manejarEnvio:', error);
    } finally {
      setEnviando(false);
    }
  };

  // Vuelve a los valores iniciales y limpia errores y tocados
  const reiniciar = () => {
    setValores(valoresIniciales);
    setErrores({});
    setTocados({});
  };

  return {
    valores,
    errores,
    tocados,
    enviando,
    manejarCambio,
    manejarSalida,
    manejarEnvio,
    reiniciar,
  };
}
