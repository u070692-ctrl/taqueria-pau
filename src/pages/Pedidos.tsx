/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Pedido, PedidoStatus } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { Clock, Package, CheckCircle, XCircle, MoreVertical, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';

const statusConfig: Record<PedidoStatus, { label: string, icon: any, color: string, ring: string }> = {
  pendiente: { label: 'Pendiente', icon: <Clock className="w-4 h-4" />, color: 'bg-amber-500', ring: 'ring-amber-200' },
  en_proceso: { label: 'En Proceso', icon: <Package className="w-4 h-4" />, color: 'bg-blue-500', ring: 'ring-blue-200' },
  entregado: { label: 'Entregado', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-500', ring: 'ring-green-200' },
  cancelado: { label: 'Cancelado', icon: <XCircle className="w-4 h-4" />, color: 'bg-red-500', ring: 'ring-red-200' },
};

export default function Pedidos() {
  const { userData } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<PedidoStatus | 'all'>('all');

  useEffect(() => {
    if (!userData) return;
    const q = query(collection(db, 'pedidos'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPedidos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pedido)));
      setLoading(false);
    }, (error) => {
      console.error("Pedidos Listener Error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userData]);

  const updateStatus = async (id: string, status: PedidoStatus) => {
    try {
      await updateDoc(doc(db, 'pedidos', id), { status });
    } catch (error) {
      console.error(error);
    }
  };

  const removePedido = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este pedido?')) {
      await deleteDoc(doc(db, 'pedidos', id));
    }
  };

  const filteredPedidos = selectedStatus === 'all' 
    ? pedidos 
    : pedidos.filter(p => p.status === selectedStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestión de Pedidos</h2>
          <p className="text-slate-500 font-medium tracking-tight">Monitoreo en tiempo real de la cocina</p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setSelectedStatus('all')}
          className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${selectedStatus === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-200'}`}
        >
          Todos
        </button>
        {(Object.keys(statusConfig) as PedidoStatus[]).map((status) => (
          <button 
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${selectedStatus === status ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-200'}`}
          >
            <div className={`w-2 h-2 rounded-full ${statusConfig[status].color}`}></div>
            {statusConfig[status].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnimatePresence>
          {filteredPedidos.map((pedido) => (
            <motion.div 
              layout
              key={pedido.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col sm:flex-row"
            >
              <div className="p-6 sm:p-8 flex-1">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 leading-none mb-2">{pedido.clienteNombre}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDate(pedido.createdAt)}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ring-4 ${statusConfig[pedido.status].ring} ${statusConfig[pedido.status].color} text-white`}>
                    {statusConfig[pedido.status].icon}
                    {statusConfig[pedido.status].label}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {pedido.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-900 text-[10px] font-bold rounded-lg">{item.cantidad}</span>
                        <span className="text-sm font-bold text-slate-700">{item.nombre}</span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total</p>
                     <p className="text-2xl font-extrabold text-slate-900 tracking-tighter">{formatCurrency(pedido.total)}</p>
                  </div>
                  <button 
                    onClick={() => removePedido(pedido.id!)}
                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-6 sm:p-8 sm:w-48 flex flex-col gap-3 justify-center border-t sm:border-t-0 sm:border-l border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center mb-1">Cambiar Estado</p>
                {(Object.keys(statusConfig) as PedidoStatus[]).map((status) => (
                  <button 
                    key={status}
                    onClick={() => updateStatus(pedido.id!, status)}
                    disabled={pedido.status === status}
                    className={`w-full py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all ${pedido.status === status ? 'bg-white text-slate-300 shadow-sm border border-slate-100' : 'bg-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white shadow-sm active:scale-95'}`}
                  >
                    {statusConfig[status].label}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!loading && filteredPedidos.length === 0 && (
        <div className="py-20 text-center bg-white rounded-[2rem] border border-slate-100 italic font-bold text-slate-300">
          No hay pedidos registrados con este estado.
        </div>
      )}
    </div>
  );
}
