import { EmprendimientoResponse } from "./emprendimiento-response.model";

export interface EmprendimientoAdminResponse extends EmprendimientoResponse {
  fechaEliminacion: string | null;
}