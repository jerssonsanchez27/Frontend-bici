import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Inventario } from '../../shared/models/models';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="header-text">
        <h1>Inventario</h1>
        <p>Control de stock de bicicletas</p>
      </div>
    </div>

    <div class="table-card">
      <div class="table-title">Stock Disponible</div>
      @if (loading()) {
        <div class="loading-state"><div class="spinner"></div> Cargando inventario...</div>
      } @else if (inventario().length === 0) {
        <div class="empty-state">No hay registros de inventario.</div>
      } @else {
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Bicicleta</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Agregar Stock</th>
            </tr>
          </thead>
          <tbody>
            @for (item of inventario(); track item.id) {
              <tr>
                <td>{{ item.id }}</td>
                <td>{{ item.bicicleta?.marca }} {{ item.bicicleta?.modelo }}</td>
                <td><strong>{{ item.stock }}</strong> unidades</td>
                <td>
                  @if (item.stock >= 10) {
                    <span class="badge badge-alto">Stock Alto</span>
                  } @else if (item.stock >= 6) {
                    <span class="badge badge-medio">Stock Medio</span>
                  } @else {
                    <span class="badge badge-bajo">⚠ Stock Bajo</span>
                  }
                </td>
                <td>
                  <div style="display:flex; gap:8px; align-items:center;">
                    <input
                      type="number"
                      min="1"
                      [value]="cantidades[item.id!] || 1"
                      (input)="cantidades[item.id!] = +$any($event.target).value"
                      style="width:70px; padding:6px 10px; border:1.5px solid var(--border); border-radius:var(--radius-sm); font-family:inherit; font-size:0.88rem;">
                    <button
                      class="btn-primary"
                      style="width:auto; padding:7px 14px; font-size:0.82rem;"
                      (click)="agregarStock(item)">
                      + Agregar
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `
})
export class InventarioComponent implements OnInit {
  inventario = signal<Inventario[]>([]);
  loading = signal(true);
  cantidades: { [id: number]: number } = {};

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() { this.cargarInventario(); }

  cargarInventario() {
    this.loading.set(true);
    this.api.getInventario().subscribe({
      next: (data) => {
        this.inventario.set(data);
        data.forEach(i => { if (i.id) this.cantidades[i.id] = 1; });
        this.loading.set(false);
      },
      error: () => { this.toast.show('Error cargando inventario', 'error'); this.loading.set(false); }
    });
  }

  agregarStock(item: Inventario) {
    const cantidad = this.cantidades[item.id!] || 1;
    if (cantidad < 1) { this.toast.show('La cantidad debe ser mayor a 0', 'error'); return; }
    this.api.agregarStock(item.id!, cantidad).subscribe({
      next: () => {
        this.toast.show(`Se agregaron ${cantidad} unidades a ${item.bicicleta?.marca}`);
        this.cargarInventario();
      },
      error: () => this.toast.show('Error al agregar stock', 'error')
    });
  }
}