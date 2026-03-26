export interface Cliente {
  documento: string;
  nombre: string;
  telefono: string;
}

export interface Bicicleta {
  id?: number;
  codigo: string;
  marca: string;
  modelo: string;
  tipo: string;
  precio: number;
}

export interface Inventario {
  id?: number;
  stock: number;
  bicicleta: Bicicleta;
}

export interface DetalleVenta {
  id?: number;
  cantidad: number;
  subtotal: number;
  bicicleta: Bicicleta;
}

export interface Venta {
  id?: number;
  total: number;
  fecha?: string;
  cliente: Cliente;
  detalles: DetalleVenta[];
}

export interface VentaRequest {
  documentoCliente: string;
  codigoBicicleta: string;
  cantidad: number;
}
