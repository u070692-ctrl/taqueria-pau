/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Producto } from '../types';
import { Utensils, Plus, Trash2, Tag, DollarSign, Package } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    categoria: 'Tacos',
    descripcion: '',
  });

  const categorias = ['Tacos', 'Especialidades', 'Bebidas', 'Postres', 'Complementos'];

  useEffect(() => {
    const q = query(collection(db, 'productos'), orderBy('categoria', 'asc'), orderBy('nombre', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProductos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Producto)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'productos'), {
        ...formData,
        precio: parseFloat(formData.precio),
      });
      setFormData({ nombre: '', precio: '', categoria: 'Tacos', descripcion: '' });
      setShowForm(false);
    } catch (error) {
      console.error(error);
    }
  };

  const removeProducto = async (id: string) => {
    if (confirm('¿Eliminar producto del menú?')) {
      await deleteDoc(doc(db, 'productos', id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Catálogo de Productos</h2>
          <p className="text-slate-500 font-medium">Administra el menú digital de la taquería</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Añadir Platillo
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
               <h3 className="col-span-full text-xl font-extrabold text-slate-900 flex items-center gap-2">
                 <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center"><Tag className="w-4 h-4" /></div>
                 Nuevo Ítem en el Menú
               </h3>

               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Nombre del Platillo</label>
                  <input required type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} placeholder="E.g. Tacos al Pastor" className="w-full bg-slate-50 border-none rounded-xl py-4 px-4 focus:ring-2 focus:ring-slate-900 font-bold text-slate-900" />
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Precio (MXN)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input required type="number" step="0.5" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} placeholder="0.00" className="w-full bg-slate-50 border-none rounded-xl py-4 pl-10 pr-4 focus:ring-2 focus:ring-slate-900 font-bold text-slate-900" />
                  </div>
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Categoría</label>
                  <select value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-4 px-4 focus:ring-2 focus:ring-slate-900 font-bold text-slate-900 appearance-none">
                    {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Descripción Corta</label>
                  <input type="text" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} placeholder="E.g. Con piña, cebolla y cilantro" className="w-full bg-slate-50 border-none rounded-xl py-4 px-4 focus:ring-2 focus:ring-slate-900 font-bold text-slate-900" />
               </div>

               <div className="col-span-full flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600">Cancelar</button>
                  <button type="submit" className="bg-orange-500 text-white px-10 py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg active:scale-95">Publicar en Menú</button>
               </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categorias.map(cat => (
          <React.Fragment key={cat}>
            {productos.filter(p => p.categoria === cat).length > 0 && (
              <div className="col-span-full pt-8 first:pt-0">
                <h3 className="text-sm font-extrabold text-orange-500 uppercase tracking-[0.2em] flex items-center gap-4">
                  {cat}
                  <div className="h-px flex-1 bg-gradient-to-r from-orange-100 to-transparent"></div>
                </h3>
              </div>
            )}
            {productos.filter(p => p.categoria === cat).map(producto => (
              <motion.div 
                layout
                key={producto.id}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200 transition-all flex flex-col group"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-extrabold text-slate-900 text-lg group-hover:text-orange-500 transition-colors uppercase tracking-tight leading-none">{producto.nombre}</h4>
                    <span className="font-extrabold text-slate-900 tracking-tighter">{formatCurrency(producto.precio)}</span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium mb-6 italic">"{producto.descripcion || 'Sin descripción'}"</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Package className="w-3 h-3" /> stock ok
                  </div>
                  <button 
                    onClick={() => removeProducto(producto.id!)}
                    className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {!loading && productos.length === 0 && (
        <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
          <Utensils className="w-16 h-16 text-slate-100 mx-auto mb-4" />
          <h3 className="text-2xl font-extrabold text-slate-300">Menú Vacío</h3>
          <p className="text-slate-300 font-bold uppercase tracking-widest text-xs mt-2">Agregue su primer platillo para comenzar</p>
        </div>
      )}
    </div>
  );
}
