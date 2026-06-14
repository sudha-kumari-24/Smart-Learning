import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
import { useNotification } from './NotificationContext';


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);  // { id, name, email } or null
  const [token, setToken] = useState(null);
  const notify = useNotification();



  useEffect(() => {
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;

      if (Date.now() > expiry) {
        logout();
        notify.show('Session expired. Please sign in again.');
      }
    } catch {
      logout();
    }
  }, [token]);


  useEffect(() => {
    const saved = localStorage.getItem('sl_auth');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed.user);
      setToken(parsed.token);
    }
  }, []);

  function saveAuth(nextUser, nextToken) {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem('sl_auth', JSON.stringify({ user: nextUser, token: nextToken }));
  }

  // console.log(localStorage.getItem('sl_auth'));

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sl_auth');
  }

 
const updateUser = (updatedUserData) => {
  setUser(prevUser => ({
    ...prevUser,
    ...updatedUserData,
    name: updatedUserData.fullName || updatedUserData.name || prevUser?.name
  }));
  
 
  const saved = localStorage.getItem('sl_auth');
  if (saved) {
    const parsed = JSON.parse(saved);
    const updatedUser = { 
      ...parsed.user, 
      ...updatedUserData,
      name: updatedUserData.fullName || updatedUserData.name || parsed.user?.name
    };
    localStorage.setItem('sl_auth', JSON.stringify({ user: updatedUser, token: parsed.token }));
  }
};


const value = { user, token, saveAuth, logout, updateUser };



  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

