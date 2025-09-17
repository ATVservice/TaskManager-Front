import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

export default function useSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // שמירת הכתובת האחרונה בכל ניווט
  useEffect(() => {
    if (user) {
      sessionStorage.setItem("lastPath", location.pathname);
    }
  }, [location, user]);

  // בזמן טעינה מחדש → ניתוב לכתובת האחרונה
  useEffect(() => {
    if (user) {
      const lastPath = sessionStorage.getItem("lastPath");
      if (lastPath && lastPath !== location.pathname) {
        navigate(lastPath, { replace: true });
      }
    }
  }, [user, navigate]); 
}
