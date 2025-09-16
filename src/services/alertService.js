import axios from 'axios';
const API_URL = process.env.REACT_APP_BACKEND_URL;

export const fetchUserAlerts = async (token, { limit = 30, skip = 0, sortBy = 'createdAt', order = 'desc', resolved } = {}) => {
  const params = new URLSearchParams();
  if (resolved !== undefined) params.append('resolved', resolved);
  params.append('limit', limit);
  params.append('skip', skip);
  params.append('sortBy', sortBy);
  params.append('order', order);

  const res = await axios.get(`${API_URL}/api/alert/getUserAlerts?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true
  });
  return res.data; 
};

export const markAlertsRead = async (token, alertIds = []) => {
  if (!Array.isArray(alertIds) || alertIds.length === 0) return "אין התראות";
  const res = await axios.post(`${API_URL}/api/alert/markRead`, { alertIds }, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true
  });
  return res.data;
};
