import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../src/context/AuthContext';

export default function useSessionManager() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const inactivityTimer = useRef(null);

  const SIX_HOURS = 6 * 60 * 60 * 1000; // 6 שעות

  function logoutUser() {
    logout();
    navigate('/login?message=timeout');
  }

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = setTimeout(() => {
      logoutUser();
    }, SIX_HOURS);
  }, [logout, navigate]);

  useEffect(() => {
    const events = ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    events.forEach(evt => {
      document.addEventListener(evt, resetInactivityTimer);
    });

    resetInactivityTimer(); // הפעלה ראשונית

    return () => {
      events.forEach(evt => {
        document.removeEventListener(evt, resetInactivityTimer);
      });
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [resetInactivityTimer]);

  return null;
}
