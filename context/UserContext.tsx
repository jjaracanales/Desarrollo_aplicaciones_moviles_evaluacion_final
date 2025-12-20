import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, removeToken } from '../services/apiService';

interface UserContextType {
  email: string;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setEmail: (email: string) => void;
  setToken: (token: string | null) => void;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  email: '',
  token: null,
  isAuthenticated: false,
  isLoading: true,
  setEmail: () => { },
  setToken: () => { },
  logout: async () => { },
});

export const useUser = () => useContext(UserContext);

interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [email, setEmail] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Verificar token existente al montar
  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const savedToken = await getToken();
      if (savedToken) {
        setToken(savedToken);
      }
    } catch (error) {
      console.error('Error checking token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await removeToken();
      setToken(null);
      setEmail('');
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  const isAuthenticated = !!token;

  return (
    <UserContext.Provider
      value={{
        email,
        token,
        isAuthenticated,
        isLoading,
        setEmail,
        setToken,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export { UserContext };

