import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// 1. Define the User type based on your Project Scope
interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'ScrumMaster' | 'Developer';
}

// 2. Define what data our Context will provide to the app
interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Function to simulate login
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('fb_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fb_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth system easily in any component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};