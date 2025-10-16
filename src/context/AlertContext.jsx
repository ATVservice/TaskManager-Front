import React, { createContext, useState, useCallback } from 'react';

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const updateUnreadCount = useCallback((count) => {
    setUnreadCount(count);
  }, []);

  return (
    <AlertContext.Provider value={{ unreadCount, updateUnreadCount }}>
      {children}
    </AlertContext.Provider>
  );
};
