import { EmprendimientoResponse } from './emprendimiento-response.model';

export interface ViandaResponse {
  id: number;
  nombreVianda: string;
  categoria: string;
  descripcion: string;
  precio: number;
  esVegano: boolean;
  esVegetariano: boolean;
  esSinTacc: boolean;
  emprendimiento: EmprendimientoResponse;
  estaDisponible: boolean;
  imagenUrl: string;
}

export interface ViandaAdminResponse extends ViandaResponse {
  fechaEliminacion: string | null;
}

export type ViandaAnyResponse = ViandaResponse | ViandaAdminResponse;