export interface DetalleViandaResponse {
  viandaId: number;
  nombreVianda: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  imagenUrl?: string;
}
