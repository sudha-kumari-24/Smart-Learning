import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  function show(message, type = 'error') {
    setNotification({ message, type });

    // auto hide after 4 sec
    setTimeout(() => setNotification(null), 4000);
  }

  function clear() {
    setNotification(null);
  }

  return (
    <NotificationContext.Provider value={{ notification, show, clear }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
