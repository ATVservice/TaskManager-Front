import api from './api.js'

const API_URL = process.env.REACT_APP_BACKEND_URL;

// משימות להיום
// הכל / שוטפות/ קבועות
export const fetchTodayTasks = async (isRecurring) => {
  const userStr = localStorage.getItem('user');

  let token = null;
  if (userStr) {
    const user = JSON.parse(userStr);
    token = user.token;
  }

  const res = await api.get(`${API_URL}/api/tasks/getTodayTasks`, {
    params: {
      isRecurringInstance: isRecurring,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true
  });
  console.log("getTodayTasks", res.data);

  return res.data;
};
// משימות קבועות
export const fetchRecurringTasks = async (token) => {

  const res = await api.get(`${API_URL}/api/taskFilters/recurringTasks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true
  });
  console.log("recurringTasks", res.data);

  return res.data;
};
// משימות שהושלמו
export const fetchCompleteds = async (token) => {


  const res = await api.get(`${API_URL}/api/taskFilters/completed`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true
  });
  console.log("completed", res.data);

  return res.data;
};
// משימות שבוטלו
export const fetchCancelled = async (token) => {

  const res = await api.get(`${API_URL}/api/taskFilters/cancelled`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true
  });
  console.log("cancelled", res.data);

  return res.data;
};
// משימות מגירה
export const fetchDrawer = async (token) => {

  const res = await api.get(`${API_URL}/api/taskFilters/drawer`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true
  });
  console.log("מגירההההה", res.data);

  return res.data;
};
export const fetchOverdueTasks = async (token) => {

  const res = await api.get(`${API_URL}/api/taskFilters/overdueTasks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true
  });
  console.log("פתוחות", res.data);

  return res.data;
};





