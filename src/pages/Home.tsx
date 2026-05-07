/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Pedido, Producto, PedidoItem } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { ClipboardList, Users, Utensils, ChevronRight, Clock, CheckCircle, Package, AlertCircle, Plus, Minus, ShoppingBag, X } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const statusIcons = {
  pendiente: <Clock className="w-4 h-4 text-amber-500" />,
  en_proceso: <Package className="w-4 h-4 text-blue-500" />,
  entregado: <CheckCircle className="w-4 h-4 text-green-500" />,
  cancelado: <AlertCircle className="w-4 h-4 text-red-500" />,
};

const statusColors = {
  pendiente: 'bg-amber-50 border-amber-100 text-amber-700',
  en_proceso: 'bg-blue-50 border-blue-100 text-blue-700',
  entregado: 'bg-green-50 border-green-100 text-green-700',
  cancelado: 'bg-red-50 border-red-100 text-red-700',
};

export default function Home() {
  const { userData, user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Pedido[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cart, setCart] = useState<Record<string, { product: Producto, quantity: number }>>({});
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  useEffect(() => {
    if (!userData || !user) return;

    // Recent orders query - Filter if customer to respect rules
    const qOrders = userData.role === 'customer'
      ? query(
          collection(db, 'pedidos'),
          where('clienteId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        )
      : query(
          collection(db, 'pedidos'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );

    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pedido));
      setRecentOrders(orders);
      setLoading(false);
    }, (error) => {
      console.error("Orders Listener Error:", error);
      setLoading(false);
    });

    // Products for menu
    const qProducts = query(collection(db, 'productos'), orderBy('categoria'), orderBy('nombre'));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      setProductos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Producto)));
    });

    return () => {
      unsubOrders();
      unsubProducts();
    };
  }, [userData, user]);

  const addToCart = (product: Producto) => {
    setCart(prev => ({
      ...prev,
      [product.id!]: {
        product,
        quantity: (prev[product.id!]?.quantity || 0) + 1
      }
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId].quantity > 1) {
        newCart[productId].quantity -= 1;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const totalCart = Object.values(cart).reduce((sum, item) => sum + (item.product.precio * item.quantity), 0);

  const placeOrder = async () => {
    if (Object.keys(cart).length === 0) return;
    setOrderStatus('sending');
    try {
      const orderData: any = {
        clienteId: user?.uid,
        clienteNombre: userData?.nombre || 'Cliente',
        items: Object.values(cart).map(item => ({
          productoId: item.product.id,
          nombre: item.product.nombre,
          cantidad: item.quantity,
          precio: item.product.precio,
          subtotal: item.product.precio * item.quantity
        })),
        total: totalCart,
        status: 'pendiente',
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'pedidos'), orderData);
      setCart({});
      setOrderStatus('success');
      setTimeout(() => setOrderStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      setOrderStatus('idle');
    }
  };

  const menuItems = [
    { title: 'Gestión de Pedidos', path: '/pedidos', icon: <ClipboardList />, roles: ['admin', 'worker'], color: 'bg-orange-500' },
    { title: 'Directorio de Clientes', path: '/clientes', icon: <Users />, roles: ['admin', 'worker'], color: 'bg-blue-500' },
    { title: 'Menú Digital', path: '/productos', icon: <Utensils />, roles: ['admin'], color: 'bg-green-500' },
  ];

  const allowedMenu = menuItems.filter(item => userData && item.roles.includes(userData.role));

  if (userData?.role === 'customer') {
    return (
      <div className="space-y-8 pb-24 lg:pb-8">
        <section className="bg-orange-500 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 text-white relative overflow-hidden shadow-2xl shadow-orange-100">
           <div className="relative z-10">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tighter mb-4">¡Ordena ahora los mejores tacos en Pau! 🌮</h1>
              <p className="text-orange-100 font-bold uppercase tracking-[0.2em] text-[10px] sm:text-sm">Sabor 100% Mexicano Directo a tu mesa</p>
           </div>
           <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-10 rotate-12 hidden lg:block">
              <Utensils className="w-64 h-64" />
           </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-2xl font-extrabold text-slate-900">Nuestro Menú</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{productos.length} Platos disponibles</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productos.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-lg transition-all">
                  <div className="flex-1 min-w-0 mr-4">
                    <h4 className="font-bold text-slate-900 uppercase tracking-tight truncate">{p.nombre}</h4>
                    <p className="text-[11px] text-slate-400 font-medium italic line-clamp-1">{p.descripcion || 'Especialidad de la casa'}</p>
                    <p className="text-orange-500 font-black mt-1">{formatCurrency(p.precio)}</p>
                  </div>
                  <button 
                    onClick={() => addToCart(p)}
                    className="w-11 h-11 bg-slate-50 group-hover:bg-orange-500 group-hover:text-white rounded-2xl flex items-center justify-center transition-all active:scale-90 border border-slate-100 group-hover:border-transparent shrink-0"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
             {/* Desktop Cart */}
            <div className="hidden lg:block bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-50 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingBag className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl font-extrabold text-slate-900">Tu Pedido</h3>
              </div>
              
              <div className="space-y-4 max-h-[40vh] overflow-y-auto mb-6 pr-2 custom-scrollbar">
                {Object.values(cart).length === 0 ? (
                  <div className="text-center py-10 text-slate-300 font-bold italic uppercase tracking-widest text-xs">
                    Tu carrito está vacío
                  </div>
                ) : (
                  Object.values(cart).map(item => (
                    <div key={item.product.id} className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm leading-tight truncate">{item.product.nombre}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{formatCurrency(item.product.precio)} x {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl shrink-0">
                        <button onClick={() => removeFromCart(item.product.id!)} className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"><Minus className="w-3 h-3" /></button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => addToCart(item.product)} className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {Object.values(cart).length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total estimado</span>
                    <span className="text-2xl font-black text-slate-900 tracking-tighter">{formatCurrency(totalCart)}</span>
                  </div>
                  <button 
                    onClick={placeOrder}
                    disabled={orderStatus === 'sending'}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
                  >
                    {orderStatus === 'sending' ? 'Enviando...' : 'Confirmar Pedido'}
                  </button>
                </div>
              )}

              {orderStatus === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-green-50 text-green-700 rounded-2xl text-center text-sm font-bold border border-green-100"
                >
                  ¡Pedido enviado con éxito! 🌮
                </motion.div>
              )}
            </div>
            
            {/* Mobile Cart Sheet Placeholder/Bottom Drawer (Handled by showing a summary button) */}
            {Object.values(cart).length > 0 && (
               <motion.div 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="lg:hidden fixed bottom-20 left-4 right-4 z-50 pointer-events-none"
               >
                 <button 
                  onClick={() => {
                     // Scroll to top of order section or open a modal (simulated by scrolling to desktop cart if it were mobile visible)
                     window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  }}
                  className="w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between pointer-events-auto active:scale-95 transition-all"
                 >
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-[10px] font-black">
                          {Object.values(cart).reduce((a, b) => a + b.quantity, 0)}
                       </div>
                       <span className="text-xs font-black uppercase tracking-widest">Ver mi pedido</span>
                    </div>
                    <span className="font-black text-orange-400">{formatCurrency(totalCart)}</span>
                 </button>
               </motion.div>
            )}

            {/* Mobile specific cart view at the end of products */}
            <div className="lg:hidden bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 mt-8">
               <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                 <ShoppingBag className="w-5 h-5 text-orange-500" />
                 Finalizar Compra
               </h3>
               {Object.values(cart).length === 0 ? (
                  <p className="text-center py-6 text-slate-400 text-xs font-bold uppercase">Agrega productos arriba</p>
               ) : (
                  <div className="space-y-4">
                     {Object.values(cart).map(item => (
                        <div key={item.product.id} className="flex items-center justify-between">
                           <span className="text-sm font-bold text-slate-700">{item.product.nombre} x {item.quantity}</span>
                           <span className="text-sm font-black text-slate-900">{formatCurrency(item.product.precio * item.quantity)}</span>
                        </div>
                     ))}
                     <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                        <span className="text-sm font-black text-slate-900 uppercase">Total</span>
                        <span className="text-xl font-black text-orange-600">{formatCurrency(totalCart)}</span>
                     </div>
                     <button 
                        onClick={placeOrder}
                        disabled={orderStatus === 'sending'}
                        className="w-full bg-slate-900 text-white font-black p-4 rounded-2xl active:scale-95 transition-all disabled:opacity-50"
                      >
                         {orderStatus === 'sending' ? 'Procesando...' : 'Pedir Ahora'}
                      </button>
                  </div>
               )}
            </div>
          </div>
        </section>

        {/* User's recent orders */}
        <section className="pt-10">
           <h3 className="text-xl font-bold text-slate-900 mb-6">Tus Pedidos Recientes</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentOrders.filter(o => o.clienteId === user?.uid).map(pedido => (
                <div key={pedido.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                   <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{formatDate(pedido.createdAt)}</p>
                      <p className="font-bold text-slate-900">{pedido.items.length} productos • {formatCurrency(pedido.total)}</p>
                   </div>
                   <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border ${statusColors[pedido.status]}`}>
                      {pedido.status}
                   </div>
                </div>
              ))}
           </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header section */}
      <section className="mb-10">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hola, {userData?.nombre} 👋</h2>
        <p className="text-slate-500 mt-1 font-medium italic underline underline-offset-4 decoration-orange-300">Panel de control de Taquería Pau</p>
      </section>

      {/* Navigation "Menu" */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {allowedMenu.map((item, idx) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link 
              to={item.path}
              className="group relative bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-slate-200 transition-all border border-slate-100 flex flex-col gap-4 overflow-hidden"
            >
              <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg uppercase tracking-tight">{item.title}</h3>
                <p className="text-slate-400 text-sm font-medium">Administrar {item.title.split(' ').pop()?.toLowerCase()}</p>
              </div>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-200 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform"></div>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* Recent Orders Section */}
      <section className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Pedidos Recientes</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Status en tiempo real</p>
          </div>
          {(userData?.role === 'admin' || userData?.role === 'worker') && (
            <Link to="/pedidos" className="text-orange-500 font-bold text-sm hover:underline flex items-center gap-1 group">
              Administrar Cocina <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center">
               <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
               <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase">Conectando a cocina...</p>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
              <ClipboardList className="w-16 h-16 text-slate-100 mx-auto mb-4" />
              <p className="text-slate-400 font-extrabold uppercase text-xs tracking-widest">Sin actividad reciente</p>
            </div>
          ) : (
            recentOrders.map((pedido) => (
              <div 
                key={pedido.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-slate-200 transition-all hover:bg-white hover:shadow-md group"
              >
                <div className="flex items-center gap-5 mb-4 sm:mb-0">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all">
                    {statusIcons[pedido.status]}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-lg leading-none mb-1">{pedido.clienteId ? pedido.clienteNombre : 'Cliente Directo'}</h4>
                    <div className="flex items-center gap-2">
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{formatDate(pedido.createdAt)}</p>
                       <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                       <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">{pedido.items.length} PLATILLOS</p>
                    </div>
                  </div>
                </div>
                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                  <p className="text-xl font-black text-slate-900 tracking-tighter">{formatCurrency(pedido.total)}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mt-1 border shadow-sm ${statusColors[pedido.status]}`}>
                    {pedido.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

