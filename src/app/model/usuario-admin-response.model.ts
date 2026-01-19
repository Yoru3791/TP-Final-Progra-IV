export interface UsuarioAdminResponse {
  id: number;
  nombreCompleto: string;
  imagenUrl: string;
  email: string;
  telefono: string;
  rolUsuario: string;
  enabled: boolean;
  createdAt: string;
  bannedAt: string;
  deletedAt: string;
}
