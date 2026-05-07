/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Usuario, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  userData: Usuario | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const DEVELOPER_EMAIL = 'u070692@cetis7.edu.mx';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'usuarios', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserData({ id: userDoc.id, ...userDoc.data() } as Usuario);
          } else {
            // First time user: Admin if matches dev email, otherwise customer
            const role: UserRole = currentUser.email === DEVELOPER_EMAIL ? 'admin' : 'customer';
            const newUserData: Usuario = {
              nombre: currentUser.displayName || 'Usuario',
              email: currentUser.email || '',
              role: role,
              createdAt: serverTimestamp(),
            };
            await setDoc(userDocRef, newUserData);
            setUserData(newUserData);
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError("No se pudieron cargar los permisos de usuario.");
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Login Error:", err);
      if (err.code === 'auth/popup-blocked') {
        setError("El navegador bloqueó la ventana de inicio de sesión. Por favor, permítela.");
      } else {
        setError("Error al iniciar sesión con Google. Inténtalo de nuevo.");
      }
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, userData, loading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
