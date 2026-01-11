import { EstadoReclamo } from "../enums/estadoReclamo.enum";

export const EstadoReclamoHelper = {
  [EstadoReclamo.PENDIENTE]: { label: 'Pendiente', cssClass: 'badge-pendiente', icon: 'fa-regular fa-clock' },
  [EstadoReclamo.EN_PROCESO]: { label: 'En Proceso', cssClass: 'badge-proceso', icon: 'fa-solid fa-gear' },
  [EstadoReclamo.RESUELTO]: { label: 'Resuelto', cssClass: 'badge-resuelto', icon: 'fa-solid fa-check' },
  [EstadoReclamo.RECHAZADO]: { label: 'Cerrado/Rechazado', cssClass: 'badge-rechazado', icon: 'fa-solid fa-xmark' },
};