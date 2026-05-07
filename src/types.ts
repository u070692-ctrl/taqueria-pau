/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'worker' | 'customer';

export interface Usuario {
  id?: string;
  nombre: string;
  email: string;
  role: UserRole;
  createdAt: any;
}

export interface Cliente {
  id?: string;
  nombre: string;
  telefono: string;
  direccion?: string;
  email?: string;
  createdAt: any;
}

export interface Producto {
  id?: string;
  nombre: string;
  precio: number;
  categoria: string;
  descripcion?: string;
  imagenUrl?: string;
}

export interface PedidoItem {
  productoId: string;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export type PedidoStatus = 'pendiente' | 'en_proceso' | 'entregado' | 'cancelado';

export interface Pedido {
  id?: string;
  clienteId?: string;
  clienteNombre: string;
  items: PedidoItem[];
  total: number;
  status: PedidoStatus;
  createdAt: any;
  workerId?: string;
}
