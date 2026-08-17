'use client';

import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { auth } from '@/lib/firebase';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged devuelve la función para darse de baja.
    // Devolverla desde el efecto hace que React la llame al desmontar.
    const desuscribir = onAuthStateChanged(auth, (usuario) => {
      setUser(usuario);
      setLoading(false);
    });

    return desuscribir;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);

  if (contexto === undefined) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }

  return contexto;
}
