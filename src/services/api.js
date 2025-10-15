import axios from "axios";
import { showLoading, hideLoading } from "./loadingService";
import toast from "react-hot-toast";

// יצירת אינסטנס גלובלי
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "/api",
});

// ========== Interceptor לפני שליחה ==========
api.interceptors.request.use(
  (config) => {
    if (config.headers && config.headers["x-skip-loading"]) return config;
    showLoading();
    return config;
  },
  (err) => {
    hideLoading();
    return Promise.reject(err);
  }
);

// ========== Interceptor לתגובות ==========
api.interceptors.response.use(
  (response) => {
    if (!(response.config && response.config.headers && response.config.headers["x-skip-loading"])) {
      hideLoading();
    }
    return response;
  },
  (error) => {
    if (error.config && !(error.config.headers && error.config.headers["x-skip-loading"])) {
      hideLoading();
    }

    if (!error.response) {
      toast.error("אין חיבור לרשת", { duration: 3000 });
      return Promise.reject(error);
    }

    const message = error.response?.data?.message;
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    // ✅ נוודא שזו לא בקשת התחברות
    const isLoginRequest = requestUrl.includes("/login");

    // 🔒 טוקן פג / לא מורשה – רק אם זו לא בקשת login
    if (!isLoginRequest && (status === 401 || message === "הסשן פג, אנא התחבר/י מחדש")) {
      localStorage.removeItem("user");
      window.location.href = "/login?message=tokenExpired";
      return;
    }

    return Promise.reject(error);
  }
);

export default api;
