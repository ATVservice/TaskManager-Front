import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../src/context/AuthContext';
const API_URL = process.env.REACT_APP_BACKEND_URL;


export default function useSessionManager() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const inactivityTimer = useRef(null);


  const SIX_HOURS = 6 * 60 * 60 * 1000;
  const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 דקות

  function logoutUser() {
    logout();
    navigate('/login', { state: { message: 'החיבור פג עקב חוסר פעילות' } });
  }

  function resetInactivityTimer() {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = setTimeout(() => {
      logoutUser();
    }, SIX_HOURS);
  }

  async function refreshToken() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const res = await fetch(`${API_URL}/api/auth/refreshToken`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('Refresh token failed:', res.status, errorText);
            logoutUser();
          }
      } catch (error) {
        console.log("שגיאה בחידוש החיבור")
      }
    }
  
  
    useEffect(() => {
        const events = ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
        events.forEach(evt => {
          document.addEventListener(evt, resetInactivityTimer);
        });
    
        resetInactivityTimer();
    
        const refreshIntervalId = setInterval(refreshToken, REFRESH_INTERVAL);
    
        return () => {
          events.forEach(evt => {
            document.removeEventListener(evt, resetInactivityTimer);
          });
          if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
          clearInterval(refreshIntervalId);
        };
      }, []);
    
      return null;
    }