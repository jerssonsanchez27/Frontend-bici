import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Cliente } from '../../shared/models/models';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="header-text">
        <h1>Clientes</h1>
        <p>Gestión de clientes de la tienda</p>
      </div>
      <button class="btn-primary-sm" (click)="showModal = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Registrar Cliente
      </button>
    </div>

    <div class="table-card">
      <div style="margin-bottom:16px;">
        <input
          type="text"
          [value]="busqueda()"
          (input)="busqueda.set($any($event.target).value)"
          placeholder="🔍 Buscar por nombre o documento..."
          style="width:100%;padding:10px 14px;border:1px solid #ddd;border-radius:8px;font-family:inherit;font-size:0.92rem;outline:none;">
      </div>

      @if (loading()) {
        <div class="loading-state"><div class="spinner"></div> Cargando clientes...</div>
      } @else if (clientesFiltrados().length === 0) {
        <div class="empty-state">
          {{ busqueda() ? 'No se encontraron clientes con "' + busqueda() + '"' : 'No hay clientes registrados.' }}
        </div>
      } @else {
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Documento</th><th>Nombre</th><th>Teléfono</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (cliente of clientesFiltrados(); track cliente.documento; let i = $index) {
              <tr>
                <td>{{ i + 1 }}</td>
                <td>{{ cliente.documento }}</td>
                <td>{{ cliente.nombre }}</td>
                <td>{{ cliente.telefono }}</td>
                <td>
                  <button (click)="confirmarEliminar(cliente)"
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

    @if (showModal) {
      <div class="modal-backdrop" (click)="cerrarModal()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <button class="modal-close" (click)="cerrarModal()">✕</button>
          <h2>Registrar Nuevo Cliente</h2>
          <div class="form-group">
            <label>Documento</label>
            <input type="text" [(ngModel)]="form.documento" placeholder="Número de documento">
          </div>
          <div class="form-group">
            <label>Nombre</label>
            <input type="text" [(ngModel)]="form.nombre" placeholder="Nombre completo">
          </div>
          <div class="form-group">
            <label>Teléfono</label>
            <input type="text" [(ngModel)]="form.telefono" placeholder="Teléfono de contacto">
          </div>
          <button class="btn-primary" [disabled]="guardando()" (click)="guardarCliente()">
            {{ guardando() ? 'Guardando...' : 'Guardar Cliente' }}
          </button>
        </div>
      </div>
    }

    @if (clienteAEliminar) {
      <div class="modal-backdrop" (click)="clienteAEliminar = null">
        <div class="modal-box" (click)="$event.stopPropagation()" style="width:380px">
          <h2>¿Eliminar cliente?</h2>
          <p style="color:var(--text-muted);margin-bottom:24px;font-size:0.92rem;">
            Estás a punto de eliminar a <strong>{{ clienteAEliminar.nombre }}</strong>. Esta acción no se puede deshacer.
          </p>
          <div style="display:flex;gap:10px;">
            <button class="btn-secondary" style="flex:1" (click)="clienteAEliminar = null">Cancelar</button>
            <button class="btn-primary" style="flex:1;background:var(--red)" (click)="eliminarCliente()">Eliminar</button>
          </div>
        </div>
      </div>
    }
  `
})
export class ClientesComponent implements OnInit {
  clientes = signal<Cliente[]>([]);
  loading = signal(true);
  guardando = signal(false);
  showModal = false;
  clienteAEliminar: Cliente | null = null;
  busqueda = signal('');

  clientesFiltrados = computed(() =>
    this.clientes().filter(c =>
      c.nombre.toLowerCase().includes(this.busqueda().toLowerCase()) ||
      c.documento.toLowerCase().includes(this.busqueda().toLowerCase())
    )
  );

  form: Cliente = { documento: '', nombre: '', telefono: '' };

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() { this.cargarClientes(); }

  cargarClientes() {
    this.loading.set(true);
    this.api.getClientes().subscribe({
      next: (data) => { this.clientes.set(data); this.loading.set(false); },
      error: () => { this.toast.show('Error cargando clientes', 'error'); this.loading.set(false); }
    });
  }

  guardarCliente() {
    if (!this.form.documento || !this.form.nombre || !this.form.telefono) {
      this.toast.show('Completa todos los campos', 'error'); return;
    }
    this.guardando.set(true);
    this.api.createCliente({ ...this.form }).subscribe({
      next: () => {
        this.toast.show('Cliente registrado exitosamente');
        this.cerrarModal();
        this.cargarClientes();
        this.guardando.set(false);
      },
      error: () => { this.toast.show('Error al registrar cliente', 'error'); this.guardando.set(false); }
    });
  }

  confirmarEliminar(cliente: Cliente) { this.clienteAEliminar = cliente; }

  eliminarCliente() {
    if (!this.clienteAEliminar) return;
    this.api.eliminarCliente(this.clienteAEliminar.documento).subscribe({
      next: () => {
        this.toast.show('Cliente eliminado');
        this.clienteAEliminar = null;
        this.cargarClientes();
      },
      error: () => this.toast.show('Error al eliminar cliente', 'error')
    });
  }

  cerrarModal() {
    this.showModal = false;
    this.form = { documento: '', nombre: '', telefono: '' };
  }
}