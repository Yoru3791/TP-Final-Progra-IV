import { environment } from "../environments/environment";

export const API_URLS = {
  BASE: environment.apiUrl,

  ADMIN: `${environment.apiUrl}/admin`,
  DUENO: `${environment.apiUrl}/dueno`,
  CLIENTE: `${environment.apiUrl}/cliente`,
  LOGGED: `${environment.apiUrl}/logged`,
  PUBLIC: `${environment.apiUrl}/public`
};
