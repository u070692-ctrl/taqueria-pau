/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogIn, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login, loading, user, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#FF6B35] clip-login h-[40vh] w-full z-0 opacity-10"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-[2rem] shadow-2xl shadow-orange-100 max-w-md w-full relative z-10 border border-slate-100"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-orange-500 rounded-[1.5rem] flex items-center justify-center text-white font-bold text-4xl shadow-xl shadow-orange-200 mx-auto mb-6 rotate-3">
            P
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Taquería Pau</h1>
          <p className="text-slate-500 font-medium">Panel de Gestión Integral</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => login()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? (
               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {loading ? 'Cargando...' : 'Acceder con Google'}
          </button>
          
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold tracking-widest">Niveles de Acceso</span></div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-slate-50 rounded-xl text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Admin</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Worker</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Client</span>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          © 2026 Taquería Pau • Sistema Pro
        </p>
      </motion.div>
    </div>
  );
}
