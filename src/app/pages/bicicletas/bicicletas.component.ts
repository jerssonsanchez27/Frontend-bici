import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Bicicleta } from '../../shared/models/models';

@Component({
  selector: 'app-bicicletas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="header-text">
        <h1>Bicicletas</h1>
        <p>Gestión del catálogo de bicicletas</p>
      </div>
    </div>

    <div class="two-col">
      <div class="form-card">
        <h3>Registrar Bicicleta</h3>
        <div class="form-group">
          <label>Código</label>
          <input type="text" [(ngModel)]="form.codigo" placeholder="Ej: MTB001">
        </div>
        <div class="form-group">
          <label>Marca</label>
          <input type="text" [(ngModel)]="form.marca" placeholder="Ej: Trek">
        </div>
        <div class="form-group">
          <label>Modelo</label>
          <input type="text" [(ngModel)]="form.modelo" placeholder="Ej: X-Caliber">
        </div>
        <div class="form-group">
          <label>Tipo</label>
          <div class="select-wrap">
            <select [(ngModel)]="form.tipo">
              <option value="">Seleccionar tipo</option>
              <option value="Montaña">Montaña</option>
              <option value="Ruta">Ruta</option>
              <option value="Urbana">Urbana</option>
              <option value="Eléctrica">Eléctrica</option>
              <option value="BMX">BMX</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Precio ($)</label>
          <input type="number" [(ngModel)]="form.precio" placeholder="0.00" min="0" step="0.01">
        </div>
        <button class="btn-primary" [disabled]="guardando()" (click)="registrarBicicleta()">
          {{ guardando() ? 'Registrando...' : 'Registrar Bicicleta' }}
        </button>
      </div>

      <div class="table-card">
        <div class="table-title">Catálogo de Bicicletas</div>
        <div style="margin-bottom:16px;">
          <input
            type="text"
            [value]="busqueda()"
            (input)="busqueda.set($any($event.target).value)"
            placeholder="🔍 Buscar por marca, modelo o código..."
            style="width:100%;padding:10px 14px;border:1px solid #ddd;border-radius:8px;font-family:inherit;font-size:0.92rem;outline:none;">
        </div>
        @if (loading()) {
          <div class="loading-state"><div class="spinner"></div> Cargando...</div>
        } @else if (bicicletasFiltradas().length === 0) {
          <div class="empty-state">
            {{ busqueda() ? 'No se encontraron bicicletas con "' + busqueda() + '"' : 'No hay bicicletas registradas.' }}
          </div>
        } @else {
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Código</th><th>Marca</th>
                <th>Modelo</th><th>Tipo</th><th>Precio</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (b of bicicletasFiltradas(); track b.id) {
                <tr>
                  <td>{{ b.id }}</td>
                  <td><span class="mono">{{ b.codigo }}</span></td>
                  <td>{{ b.marca }}</td>
                  <td>{{ b.modelo }}</td>
                  <td>{{ b.tipo }}</td>
                  <td>{{ '$' + b.precio.toLocaleString() }}</td>
                  <td>
                    <button (click)="confirmarEliminar(b)"
                      style="background:var(--red);color:#fff;border:none;padding:6px 14px;border-radius:var(--radius-sm);font-family:inherit;font-size:0.82rem;font-weight:600;cursor:pointer;">
                      Eliminar
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>

    @if (bicicletaAEliminar) {
      <div class="modal-backdrop" (click)="bicicletaAEliminar = null">
        <div class="modal-box" (click)="$event.stopPropagation()" style="width:380px">
          <h2>¿Eliminar bicicleta?</h2>
          <p style="color:var(--text-muted);margin-bottom:25px;font-size:0.92rem;">
            Estás a punto de eliminar <strong>{{ bicicletaAEliminar.marca }} {{ bicicletaAEliminar.modelo }}</strong>. Esta acción no se puede deshacer.
          </p>
          <div style="display:flex;gap:10px;">
            <button class="btn-secondary" style="flex:1" (click)="bicicletaAEliminar = null">Cancelar</button>
            <button class="btn-primary" style="flex:1;background:var(--red)" (click)="eliminarBicicleta()">Eliminar</button>
          </div>
        </div>
      </div>
    }
  `
})
export class BicicletasComponent implements OnInit {
  bicicletas = signal<Bicicleta[]>([]);
  loading = signal(true);
  guardando = signal(false);
  bicicletaAEliminar: Bicicleta | null = null;
  busqueda = signal('');

  bicicletasFiltradas = computed(() =>
    this.bicicletas().filter(b =>
      b.marca.toLowerCase().includes(this.busqueda().toLowerCase()) ||
      b.modelo.toLowerCase().includes(this.busqueda().toLowerCase()) ||
      b.codigo.toLowerCase().includes(this.busqueda().toLowerCase())
    )
  );

  form: Bicicleta = { codigo: '', marca: '', modelo: '', tipo: '', precio: 0 };

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() { this.cargarBicicletas(); }

  cargarBicicletas() {
    this.loading.set(true);
    this.api.getBicicletas().subscribe({
      next: (data) => { this.bicicletas.set(data); this.loading.set(false); },
      error: () => { this.toast.show('Error cargando bicicletas', 'error'); this.loading.set(false); }
    });
  }

  registrarBicicleta() {
    if (!this.form.codigo || !this.form.marca || !this.form.modelo || !this.form.tipo || !this.form.precio) {
      this.toast.show('Completa todos los campos', 'error'); return;
    }
    this.guardando.set(true);
    this.api.createBicicleta({ ...this.form }).subscribe({
      next: () => {
        this.toast.show('Bicicleta registrada exitosamente');
        this.form = { codigo: '', marca: '', modelo: '', tipo: '', precio: 0 };
        this.cargarBicicletas();
        this.guardando.set(false);
      },
      error: () => { this.toast.show('Error al registrar bicicleta', 'error'); this.guardando.set(false); }
    });
  }

  confirmarEliminar(b: Bicicleta) { this.bicicletaAEliminar = b; }

  eliminarBicicleta() {
    if (!this.bicicletaAEliminar?.id) return;
    this.api.eliminarBicicleta(this.bicicletaAEliminar.id).subscribe({
      next: () => {
        this.toast.show('Bicicleta eliminada');
        this.bicicletaAEliminar = null;
        this.cargarBicicletas();
      },
      error: () => this.toast.show('Error al eliminar bicicleta', 'error')
    });
  }
}