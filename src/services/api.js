import axios from "axios";
import { showLoading, hideLoading } from "./loadingService";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "/api",
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // טיפול גלובלי
    if (!error.response) {
      toast.error("אין חיבור", { duration: 3000 });
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use(config => {
  if (config.headers && config.headers['x-skip-loading']) return config;
  showLoading();
  return config;
}, err => {
  hideLoading();
  return Promise.reject(err);
});

api.interceptors.response.use(response => {
  if (!(response.config && response.config.headers && response.config.headers['x-skip-loading'])) {
    hideLoading();
  }
  return response;
}, error => {
  if (error.config && !(error.config.headers && error.config.headers['x-skip-loading'])) {
    hideLoading();
  }
  return Promise.reject(error);
});

export default api;
