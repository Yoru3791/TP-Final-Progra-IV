import { EstadoPedido } from '../enums/estadoPedido.enum';
import { DetalleViandaResponse } from './detalle-vianda-response.model';
import { EmprendimientoResponse } from './emprendimiento-response.model';
import { UsuarioResponse } from './usuario-response.model';

export interface PedidoResponse {
  id: number;
  cliente: UsuarioResponse;
  estado: EstadoPedido;
  fechaEntrega: string;
  total: number;
  emprendimiento: EmprendimientoResponse;
  viandas: DetalleViandaResponse[];
  _links?: any;
}
