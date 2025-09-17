import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

export default function useSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // רשימת הנתיבים התקינים לפי תפקיד
  const getValidPathsForUser = (userRole) => {
    const commonPaths = ['/createTask', '/tasks', '/recyclingBin', '/allAlerts'];
    const managerPaths = ['/association', '/register', '/goals', '/employee', '/adminDashboard', '/reports'];
    const employeePaths = ['/dashboard'];

    if (userRole === 'מנהל') {
      return [...commonPaths, ...managerPaths];
    } else if (userRole === 'עובד') {
      return [...commonPaths, ...employeePaths];
    }
    return [];
  };

  // בדיקה האם הנתיב תקין עבור המשתמש
  const isValidPath = (path, userRole) => {
    const validPaths = getValidPathsForUser(userRole);
    return validPaths.some(validPath => path.startsWith(validPath)) || 
           path.startsWith('/history/') || 
           path.startsWith('/reset-password/');
  };

  // שמירת הכתובת האחרונה רק אם היא תקינה
  useEffect(() => {
    if (user && isValidPath(location.pathname, user.role)) {
      sessionStorage.setItem("lastPath", location.pathname);
    }
  }, [location, user]);

  // בזמן טעינה מחדש → ניתוב לכתובת האחרונה (אם תקינה)
  useEffect(() => {
    if (user) {
      const lastPath = sessionStorage.getItem("lastPath");
      if (lastPath && 
          lastPath !== location.pathname && 
          isValidPath(lastPath, user.role)) {
        navigate(lastPath, { replace: true });
      } else if (location.pathname === '/') {
        // אם נמצאים בנתיב הבסיס, נווט לדף הבית המתאים
        const defaultPath = user.role === 'מנהל' ? '/adminDashboard' : '/dashboard';
        navigate(defaultPath, { replace: true });
      }
    }
  }, [user, navigate, location.pathname]);
}