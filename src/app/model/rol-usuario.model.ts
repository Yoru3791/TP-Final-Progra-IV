export class RolUsuario {
  private constructor(
    public readonly identificadorBDD: string,
    public readonly descripcion: string
  ) {}

  static readonly INVITADO  = new RolUsuario('INVITADO', 'Invitado');
  static readonly CLIENTE   = new RolUsuario('CLIENTE', 'Cliente');
  static readonly DUENO     = new RolUsuario('DUENO', 'Dueño');
  static readonly ADMIN     = new RolUsuario('ADMIN', 'Admin');

  static readonly ROLES_LOGUEADOS = [
    RolUsuario.CLIENTE,
    RolUsuario.DUENO,
    RolUsuario.ADMIN,
  ] as const;
}
