import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Cliente, Bicicleta, Venta } from '../../shared/models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="header-text">
        <h1>Ventas</h1>
        <p>Gestión de ventas de bicicletas</p>
      </div>
    </div>

    <div class="two-col">
      <div class="form-card">
        <h3>Registrar Venta</h3>
        <div class="form-group">
          <label>Cliente</label>
          <div class="select-wrap">
            <select [(ngModel)]="form.documentoCliente">
              <option value="">Seleccionar cliente</option>
              @for (c of clientes(); track c.documento) {
                <option [value]="c.documento">{{ c.nombre }}</option>
              }
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Bicicleta</label>
          <div class="select-wrap">
            <select [(ngModel)]="form.codigoBicicleta" (ngModelChange)="calcularTotal()">
              <option value="">Seleccionar bicicleta</option>
              @for (b of bicicletas(); track b.codigo) {
                          <option [value]="b.codigo">{{ b.marca }} {{ b.modelo }} — 
                    {{ '$' + b.precio.toLocaleString() }}</option>
}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Cantidad</label>
          <input type="number" [(ngModel)]="form.cantidad" min="1" (ngModelChange)="calcularTotal()">
        </div>
        <div class="form-group">
          <label>Fecha</label>
          <input type="text" [value]="fechaHoy" readonly>
        </div>
        <div class="venta-total-row">
          <span class="label">Total:</span>
         <span class="value">{{ '$' + total().toLocaleString() }}</span>
        </div>
        <button class="btn-primary" [disabled]="guardando()" (click)="registrarVenta()">
          {{ guardando() ? 'Registrando...' : 'Registrar Venta' }}
        </button>
      </div>

      <div class="table-card">
        <div class="table-title">Historial de Ventas</div>
        @if (loading()) {
          <div class="loading-state"><div class="spinner"></div> Cargando...</div>
        } @else if (ventas().length === 0) {
          <div class="empty-state">No hay ventas registradas.</div>
        } @else {
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Cliente</th><th>Bicicleta</th>
                <th>Cantidad</th><th>Total</th><th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              @for (v of ventas(); track v.id) {
                <tr>
                  <td>{{ v.id }}</td>
                  <td>{{ v.cliente?.nombre }}</td>
                  <td>{{ getPrimerDetalle(v) }}</td>
                  <td>{{ getCantidad(v) }}</td>
                 <td>{{ '$' + v.total.toLocaleString() }}</td>
                  <td>{{ fechaHoy }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `
})
export class VentasComponent implements OnInit {
  clientes = signal<Cliente[]>([]);
  bicicletas = signal<Bicicleta[]>([]);
  ventas = signal<Venta[]>([]);
  loading = signal(true);
  guardando = signal(false);
  total = signal(0);

  form = { documentoCliente: '', codigoBicicleta: '', cantidad: 1 };

  get fechaHoy(): string {
    const d = new Date();
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }

  constructor(private api: ApiService, private toast: ToastService) {}

ngOnInit() {
  this.api.getClientes().subscribe({
    next: (clientes) => this.clientes.set(clientes),
    error: () => this.toast.show('Error cargando clientes', 'error')
  });

  this.api.getBicicletas().subscribe({
    next: (bicicletas) => this.bicicletas.set(bicicletas),
    error: () => this.toast.show('Error cargando bicicletas', 'error')
  });

  this.api.getVentas().subscribe({
    next: (ventas) => { this.ventas.set(ventas); this.loading.set(false); },
    error: () => { this.loading.set(false); }
  });
}

  calcularTotal() {
    const bici = this.bicicletas().find(b => b.codigo === this.form.codigoBicicleta);
    this.total.set((bici?.precio ?? 0) * (this.form.cantidad || 0));
  }

  registrarVenta() {
    if (!this.form.documentoCliente || !this.form.codigoBicicleta || this.form.cantidad < 1) {
      this.toast.show('Completa todos los campos correctamente', 'error'); return;
    }
    this.guardando.set(true);
    this.api.createVenta({ ...this.form }).subscribe({
      next: () => {
        this.api.getVentas().subscribe({
          next: (ventas) => this.ventas.set(ventas)
        });
        this.toast.show('Venta registrada exitosamente');
        this.form = { documentoCliente: '', codigoBicicleta: '', cantidad: 1 };
        this.total.set(0);
        this.guardando.set(false);
      },
      error: () => {
        this.toast.show('Error al registrar venta', 'error');
        this.guardando.set(false);
      }
    });
  }

  getPrimerDetalle(v: Venta): string {
    const det = v.detalles?.[0];
    return det?.bicicleta ? `${det.bicicleta.marca} ${det.bicicleta.modelo}` : '—';
  }

  getCantidad(v: Venta): number | string {
    return v.detalles?.[0]?.cantidad ?? '—';
  }
}