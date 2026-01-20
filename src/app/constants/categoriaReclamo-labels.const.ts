import { CategoriaReclamo } from "../enums/categoriaReclamo.enum";

export const CategoriaReclamoLabel: Record<CategoriaReclamo, string> = {
  [CategoriaReclamo.MI_CUENTA]: 'Problema con mi cuenta',
  [CategoriaReclamo.BUGS_ERRORES]: 'Bug o error del sistema',
  [CategoriaReclamo.PEDIDOS]: 'Inconveniente con un pedido',
  [CategoriaReclamo.ESTETICA_UX]: 'Sugerencia estética / UX',
  [CategoriaReclamo.OTROS_USUARIOS]: 'Conducta de otro usuario',
  [CategoriaReclamo.OTROS]: 'Otros motivos'
};