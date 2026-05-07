/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Home from './pages/Home';
import Clientes from './pages/Clientes';
import Pedidos from './pages/Pedidos';
import Productos from './pages/Productos';
import Login from './pages/Login';
import { LogOut, Home as HomeIcon, Users, Utensils, ClipboardList, Menu as MenuIcon, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function ProtectedRoute({ children, roles }: { children: React.ReactNode, roles?: string[] }) {
  const { user, userData, loading } = useAuth();
  
  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-4">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Validando Credenciales</p>
    </div>
  );

  if (!user) return <Navigate to="/login" />;
  
  // If user is logged in but has no profile data (role), send back to login for role selection
  if (user && !userData) return <Navigate to="/login" />;
  
  if (roles && userData && !roles.includes(userData.role)) return <Navigate to="/" />;
  
  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  const { userData, logout, updateUserRole } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [showRoleSwitcher, setShowRoleSwitcher] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isHome && (
              <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ChevronLeft className="w-6 h-6 text-slate-600" />
              </Link>
            )}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-200">
                P
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-slate-900 leading-none">Taquería Pau</h1>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Sabor Auténtico</span>
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <Link to="/" className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${location.pathname === '/' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Inicio</Link>
            {(userData?.role === 'admin' || userData?.role === 'worker') && (
              <>
                <Link to="/pedidos" className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${location.pathname === '/pedidos' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Pedidos</Link>
                <Link to="/clientes" className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${location.pathname === '/clientes' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Clientes</Link>
              </>
            )}
            {userData?.role === 'admin' && (
              <Link to="/productos" className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${location.pathname === '/productos' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Menú</Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
             <div 
              className="relative cursor-pointer group"
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
             >
                <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-slate-900 leading-none">{userData?.nombre}</p>
                    <p className="text-[10px] text-orange-500 font-bold uppercase tracking-tighter flex items-center justify-end gap-1">
                      {userData?.role} <ChevronRight className="w-2 h-2 rotate-90" />
                    </p>
                </div>
                <div className="sm:hidden w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                  {userData?.role.charAt(0).toUpperCase()}
                </div>

                <AnimatePresence>
                  {showRoleSwitcher && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-[60]"
                    >
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest p-2 border-b border-slate-50 mb-1">Cambiar de Acceso</p>
                      {(['admin', 'worker', 'customer'] as UserRole[]).map((r) => (
                        <button
                          key={r}
                          disabled={userData?.role === r}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateUserRole(r);
                            setShowRoleSwitcher(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold capitalize transition-colors ${userData?.role === r ? 'bg-slate-50 text-slate-300' : 'hover:bg-orange-50 text-slate-600 hover:text-orange-600'}`}
                        >
                          {r === 'customer' ? 'Cliente' : r === 'worker' ? 'Trabajador' : 'Administrador'}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
             
             <button 
              onClick={() => logout()}
              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Cerrar Sesión"
             >
                <LogOut className="w-5 h-5" />
             </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="md:hidden sticky bottom-0 bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-around z-50">
          <Link to="/" className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-orange-500' : 'text-slate-400'}`}>
            <HomeIcon className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">Inicio</span>
          </Link>
          {(userData?.role === 'admin' || userData?.role === 'worker') && (
            <>
              <Link to="/pedidos" className={`flex flex-col items-center gap-1 ${location.pathname === '/pedidos' ? 'text-orange-500' : 'text-slate-400'}`}>
                <ClipboardList className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase">Pedidos</span>
              </Link>
              <Link to="/clientes" className={`flex flex-col items-center gap-1 ${location.pathname === '/clientes' ? 'text-orange-500' : 'text-slate-400'}`}>
                <Users className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase">Clientes</span>
              </Link>
            </>
          )}
          {userData?.role === 'admin' && (
            <Link to="/productos" className={`flex flex-col items-center gap-1 ${location.pathname === '/productos' ? 'text-orange-500' : 'text-slate-400'}`}>
              <Utensils className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase">Menú</span>
            </Link>
          )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout><Home /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/clientes" element={
            <ProtectedRoute roles={['admin', 'worker']}>
              <Layout><Clientes /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/pedidos" element={
            <ProtectedRoute roles={['admin', 'worker']}>
              <Layout><Pedidos /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/productos" element={
            <ProtectedRoute roles={['admin']}>
              <Layout><Productos /></Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
