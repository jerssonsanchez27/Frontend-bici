import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'clientes',
    loadComponent: () => import('./pages/clientes/clientes.component').then(m => m.ClientesComponent)
  },
  {
    path: 'bicicletas',
    loadComponent: () => import('./pages/bicicletas/bicicletas.component').then(m => m.BicicletasComponent)
  },
  {
    path: 'inventario',
    loadComponent: () => import('./pages/inventario/inventario.component').then(m => m.InventarioComponent)
  },
  {
    path: 'ventas',
    loadComponent: () => import('./pages/ventas/ventas.component').then(m => m.VentasComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
