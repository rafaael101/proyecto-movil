import type { Cancha } from '../tipos/cancha';

// Catálogo fijo de canchas (RN05): vive en el código, no en Firestore
export const CANCHAS: Cancha[] = [
  {
    idCancha: 'sullivan',
    nombre: 'Unidad Deportiva Juan A. Rodríguez Sullivan',
    latitud: 31.856794,
    longitud: -116.613772,
  },
  {
    idCancha: 'parque-morelos',
    nombre: 'Parque Morelos',
    latitud: 31.857799,
    longitud: -116.593759,
  },
  {
    idCancha: 'siglo-xxi',
    nombre: 'Unidad Deportiva Siglo XXI',
    latitud: 31.850188,
    longitud: -116.569762,
  },
  {
    idCancha: 'uabc-sauzal',
    nombre: 'UABC Sauzal — Canchas de básquetbol',
    latitud: 31.864083,
    longitud: -116.666502,
  },
  {
    idCancha: 'parque-hidalgo',
    nombre: 'Parque Hidalgo',
    latitud: 31.856977,
    longitud: -116.587417,
  },
  {
    idCancha: 'gimnasio-municipal',
    nombre: 'Gimnasio Municipal Óscar "Tigre" García',
    latitud: 31.868311,
    longitud: -116.613094,
  },
  {
    idCancha: 'parque-la-hoja',
    nombre: 'Parque De La Hoja',
    latitud: 31.88161,
    longitud: -116.603568,
  },
];

// Cancha de prueba para desarrollo y la demostración en clase (RN05). Sin las
// variables del .env no aparece.
// Sirve para probar RN02 desde casa; sus coordenadas solo viven en el .env (§15).
const textoLatitudPrueba = process.env.EXPO_PUBLIC_CANCHA_PRUEBA_LAT;
const textoLongitudPrueba = process.env.EXPO_PUBLIC_CANCHA_PRUEBA_LNG;
const latitudPrueba = Number(textoLatitudPrueba);
const longitudPrueba = Number(textoLongitudPrueba);

// Se agrega solo si las dos variables existen y son números válidos.
// También se revisa que no estén vacías, porque Number('') da 0 y no NaN.
if (
  textoLatitudPrueba !== undefined &&
  textoLatitudPrueba !== '' &&
  textoLongitudPrueba !== undefined &&
  textoLongitudPrueba !== '' &&
  !Number.isNaN(latitudPrueba) &&
  !Number.isNaN(longitudPrueba)
) {
  CANCHAS.push({
    idCancha: 'prueba',
    nombre: 'Cancha de prueba',
    latitud: latitudPrueba,
    longitud: longitudPrueba,
  });
}
