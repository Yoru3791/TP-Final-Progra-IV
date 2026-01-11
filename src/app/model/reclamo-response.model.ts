import { CategoriaReclamo } from "../enums/categoriaReclamo.enum";
import { EstadoReclamo } from "../enums/estadoReclamo.enum";


export interface Reclamo {
  id: number;
  codigoTicket: string;
  emailUsuario: string;
  categoria: CategoriaReclamo;
  descripcion: string;
  estado: EstadoReclamo;
  fechaCreacion: string;
  respuestaAdmin?: string;
}