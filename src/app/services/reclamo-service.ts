import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReclamoRequest } from '../model/reclamo-request.model';
import { Observable } from 'rxjs';
import { Reclamo } from '../model/reclamo-response.model';
import { EstadoReclamo } from '../enums/estadoReclamo.enum';

@Injectable({
  providedIn: 'root',
})
export class ReclamoService {
  private apiUrl = 'http://localhost:8080/api/public/reclamos';
  private apiUrlCliente = 'http://localhost:8080/api/cliente/reclamos';
  private apiUrlAdmin = 'http://localhost:8080/api/admin/reclamos';

  constructor(private http: HttpClient) {}

  enviarReclamo(reclamo: ReclamoRequest): Observable<string> {
    return this.http.post(this.apiUrl, reclamo, { responseType: 'text' });
  }

  getMisReclamos() {
    return this.http.get<Reclamo[]>(`${this.apiUrlCliente}`);
  }

  // === METODOS ADMIN ===
  getAllReclamos() {
    return this.http.get<Reclamo[]>(`${this.apiUrlAdmin}`);
  }

  actualizarEstado(id: number, nuevoEstado: EstadoReclamo, respuestaAdmin: string) {
    const body = { nuevoEstado, respuestaAdmin };
    return this.http.put(`${this.apiUrlAdmin}/id/${id}/estado`, body);
  }
}
