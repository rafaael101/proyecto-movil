import { CHECK_IN_DISTANCIA_MAXIMA_METROS } from '../constantes/configuracion';
import type { Coordenadas } from '../tipos/cancha';

const METROS_POR_GRADO = 111320; // 1° de latitud ≈ 111.32 km

/**
 * Distancia en metros entre dos puntos (RN02).
 * Pitágoras sobre el mapa. La longitud se "encoge" con cos(latitud).
 * A 150 m el error frente a la fórmula de la esfera (Haversine) es de centímetros.
 */
export function calcularDistanciaMetros(origen: Coordenadas, destino: Coordenadas): number {
  // Math.cos trabaja en radianes: grados × (π / 180)
  const latitudMedia = ((origen.latitud + destino.latitud) / 2) * (Math.PI / 180);
  const dy = (destino.latitud - origen.latitud) * METROS_POR_GRADO;
  const dx = (destino.longitud - origen.longitud) * METROS_POR_GRADO * Math.cos(latitudMedia);
  return Math.sqrt(dx * dx + dy * dy);
}

/** RN02: true si la distancia es de 150 m o menos. */
export function estaDentroDelRadio(distanciaMetros: number): boolean {
  return distanciaMetros <= CHECK_IN_DISTANCIA_MAXIMA_METROS;
}
