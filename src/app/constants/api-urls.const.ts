import { environment } from '../environments/environment';

export const API_URLS = {
  BASE: environment.apiUrl,

  ADMIN: `${environment.apiUrl}/api/admin`,
  DUENO: `${environment.apiUrl}/api/dueno`,
  CLIENTE: `${environment.apiUrl}/api/cliente`,
  LOGGED: `${environment.apiUrl}/api/logged`,
  PUBLIC: `${environment.apiUrl}/api/public`,
};
