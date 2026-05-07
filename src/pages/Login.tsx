/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogIn, AlertCircle, Shield, Briefcase, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';

export default function Login() {
  const { login, loading, user, userData, error, setInitialRole } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (user && userData) {
      navigate('/');
    }
  }, [user, userData, navigate]);

  const handleRoleSelection = async (role: UserRole) => {
    setSelectedRole(role);
    await setInitialRole(role);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#FF6B35] clip-login h-[40vh] w-full z-0 opacity-10"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-2xl shadow-orange-100 max-w-md w-full relative z-10 border border-slate-100"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange-500 rounded-[1.5rem] flex items-center justify-center text-white font-bold text-4xl shadow-xl shadow-orange-200 mx-auto mb-6 rotate-3">
            P
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Taquería Pau</h1>
          <p className="text-slate-500 font-medium tracking-tight">Panel de Gestión Integral</p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-xs font-bold"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          {!user ? (
            <motion.div 
              key="auth-step"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
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
                {loading ? 'Preparando...' : 'Acceder con Google'}
              </button>
              <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                Seguridad garantizada por Google OAuth 2.0
              </p>
            </motion.div>
          ) : !userData ? (
            <motion.div 
              key="role-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-lg font-bold text-slate-800">¡Hola, {user.displayName?.split(' ')[0]}!</h2>
                <p className="text-sm text-slate-500 font-medium">Selecciona tu nivel de acceso:</p>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'admin', label: 'Administrador', icon: <Shield className="w-5 h-5" />, color: 'bg-orange-500', desc: 'Control total del sistema' },
                  { id: 'worker', label: 'Trabajador', icon: <Briefcase className="w-5 h-5" />, color: 'bg-blue-500', desc: 'Pedidos y atención al cliente' },
                  { id: 'customer', label: 'Cliente', icon: <UserIcon className="w-5 h-5" />, color: 'bg-green-500', desc: 'Realizar órdenes y ver menú' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleRoleSelection(item.id as UserRole)}
                    disabled={selectedRole !== null}
                    className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all border border-transparent hover:border-slate-200 group relative overflow-hidden"
                  >
                    <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900 leading-none mb-1">{item.label}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.desc}</p>
                    </div>
                    {selectedRole === item.id && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                         <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
             <div className="py-10 text-center">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Sincronizando perfil...</p>
             </div>
          )}
        </AnimatePresence>

        <p className="mt-10 text-center text-[10px] text-slate-300 uppercase tracking-widest font-black italic">
          © 2026 Taquería Pau • Sistema Pro
        </p>
      </motion.div>
    </div>
  );
}
