import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div class="header-text">
        <h1>Dashboard</h1>
        <p>Resumen general de la tienda</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-label">Total Clientes</span>
          <div class="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
        </div>
        <div class="stat-value">{{ loading() ? '—' : stats().clientes }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-label">Total Bicicletas</span>
          <div class="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
              <path d="M15 6a1 1 0 0 0-1-1h-1l-5 8H3"/><path d="m12 6 3.5 11.5"/>
            </svg>
          </div>
        </div>
        <div class="stat-value">{{ loading() ? '—' : stats().bicicletas }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-label">Stock Total</span>
          <div class="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
        </div>
        <div class="stat-value">{{ loading() ? '—' : stats().stock }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-label">Ventas Totales</span>
          <div class="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
        </div>
        <div class="stat-value">{{ loading() ? '—' : ('$' + stats().ventas.toLocaleString()) }}</div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  stats = signal({ clientes: 0, bicicletas: 0, stock: 0, ventas: 0 });

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
  this.api.getClientes().subscribe({
    next: (c) => this.stats.update(s => ({ ...s, clientes: c.length }))
  });

  this.api.getBicicletas().subscribe({
    next: (b) => this.stats.update(s => ({ ...s, bicicletas: b.length }))
  });

  this.api.getInventario().subscribe({
    next: (inv) => {
      const stock = inv.reduce((s, i) => s + (i.stock || 0), 0);
      this.stats.update(s => ({ ...s, stock }));
    }
  });

  this.api.getVentas().subscribe({
    next: (v) => {
      const ventas = v.reduce((s, venta) => s + (venta.total || 0), 0);
      this.stats.update(s => ({ ...s, ventas }));
      this.loading.set(false);
    },
    error: () => this.loading.set(false)
  });
}
}