/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Cliente } from '../types';
import { handleFirestoreError, OperationType } from '../lib/errorHandlers';
import { UserPlus, Search, Phone, Mail, MapPin, User, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
  });

  useEffect(() => {
    const q = query(collection(db, 'clientes'), orderBy('nombre', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setClientes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cliente)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'clientes'), {
        ...formData,
        createdAt: serverTimestamp(),
      });
      setFormData({ nombre: '', telefono: '', email: '', direccion: '' });
      setShowForm(false);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.telefono.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Directorio de Clientes</h2>
          <p className="text-slate-500 font-medium">Gestiona la base de datos de comensales</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center"><User className="w-4 h-4" /></div>
                Registro Express
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Nombre Completo *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.nombre}
                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                    placeholder="E.g. Juan Pérez"
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Teléfono *</label>
                  <input 
                    required
                    type="tel" 
                    value={formData.telefono}
                    onChange={e => setFormData({...formData, telefono: e.target.value})}
                    placeholder="E.g. 55 1234 5678"
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="E.g. juan@pau.com"
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Dirección</label>
                  <input 
                    type="text" 
                    value={formData.direccion}
                    onChange={e => setFormData({...formData, direccion: e.target.value})}
                    placeholder="E.g. Calle 123, Col. Centro"
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600">Cancelar</button>
                <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95">Guardar Cliente</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Buscar por nombre o teléfono..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-orange-500 transition-all shadow-sm font-medium"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClientes.map((cliente) => (
          <motion.div 
            layout
            key={cliente.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200 transition-all group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 font-bold text-xl group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                {cliente.nombre.charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 line-clamp-1">{cliente.nombre}</h4>
                <div className="flex items-center gap-1 text-slate-400">
                  <Phone className="w-3 h-3" />
                  <span className="text-xs font-medium">{cliente.telefono}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 border-t border-slate-50 pt-4">
              {cliente.email && (
                <div className="flex items-center gap-2 text-slate-500">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium truncate">{cliente.email}</span>
                </div>
              )}
              {cliente.direccion && (
                <div className="flex items-start gap-2 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 mt-0.5" />
                  <span className="text-xs font-medium line-clamp-2">{cliente.direccion}</span>
                </div>
              )}
            </div>

            <button className="w-full mt-6 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-all">
              Ver Historial <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </div>

      {!loading && filteredClientes.length === 0 && (
        <div className="py-20 text-center text-slate-400 font-bold italic">
          No se encontraron clientes que coincidan con la búsqueda.
        </div>
      )}
    </div>
  );
}
