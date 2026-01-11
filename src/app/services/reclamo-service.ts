import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReclamoRequest } from '../model/reclamo-request.model';
import { Observable } from 'rxjs';
import { Reclamo } from '../model/reclamo-response.model';

@Injectable({
  providedIn: 'root',
})
export class ReclamoService {
  private apiUrl = 'http://localhost:8080/api/public/reclamos';
  private apiUrlCliente = 'http://localhost:8080/api/cliente/reclamos';

  constructor(private http: HttpClient) {}

  enviarReclamo(reclamo: ReclamoRequest): Observable<string> {
    return this.http.post(this.apiUrl, reclamo, { responseType: 'text' });
  }

  getMisReclamos() {
    return this.http.get<Reclamo[]>(`${this.apiUrlCliente}`);
  }
}
