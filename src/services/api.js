import axios from "axios";
import { showLoading, hideLoading } from "./loadingService";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "/api",
  // ... headers defaults
});

// אפשר לשים תנאי לדילוג (לדוגמה header X-Skip-Loading)
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
