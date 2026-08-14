import React, { createContext, useContext, useState } from 'react';
import { login as apiLogin } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState(localStorage.getItem('role') || null);

  async function login(email, password) {
    const { token, role } = await apiLogin(email, password);
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    setRole(role);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setRole(null);
  }

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
