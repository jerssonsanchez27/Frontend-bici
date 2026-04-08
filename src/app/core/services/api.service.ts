import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente, Bicicleta, Inventario, Venta, VentaRequest } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = 'https://backtienda-ygxkn5l8.b4a.run/api';

  constructor(private http: HttpClient) {}

  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.base}/clientes`);
  }
  createCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.base}/clientes`, cliente);
  }

  getBicicletas(): Observable<Bicicleta[]> {
    return this.http.get<Bicicleta[]>(`${this.base}/bicicletas`);
  }
  createBicicleta(bici: Bicicleta): Observable<Bicicleta> {
    return this.http.post<Bicicleta>(`${this.base}/bicicletas`, bici);
  }

  getInventario(): Observable<Inventario[]> {
    return this.http.get<Inventario[]>(`${this.base}/inventario`);
  }

  getVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.base}/ventas`);
  }
  createVenta(req: VentaRequest): Observable<Venta> {
    return this.http.post<Venta>(`${this.base}/ventas`, req);
  }

  agregarStock(id: number, cantidad: number): Observable<Inventario> {
    return this.http.put<Inventario>(`${this.base}/inventario/${id}/stock?cantidad=${cantidad}`, {});
  }

  eliminarCliente(documento: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/clientes/${documento}`);
  }

  eliminarBicicleta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/bicicletas/${id}`);
  }
}