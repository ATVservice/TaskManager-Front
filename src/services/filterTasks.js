import axios from 'axios';
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
      const res = await axios.get(`${API_URL}/api/tasks/getTodayTasks`, {
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
export const fetchRecurringTasks = async () => {
    const userStr = localStorage.getItem('user');

    let token = null;
    if (userStr) {
        const user = JSON.parse(userStr);
        token = user.token;
    }
      const res = await axios.get(`${API_URL}/api/taskFilters/recurringTasks`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true
          });
          console.log("recurringTasks", res.data);

      return res.data;
  };
  // משימות שהושלמו
export const fetchCompleteds = async () => {
    const userStr = localStorage.getItem('user');

    let token = null;
    if (userStr) {
        const user = JSON.parse(userStr);
        token = user.token;
    }
      const res = await axios.get(`${API_URL}/api/taskFilters/completed`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true
          });
          console.log("completed", res.data);

      return res.data;
  };
  // משימות שבוטלו
export const fetchCancelled = async () => {
    const userStr = localStorage.getItem('user');

    let token = null;
    if (userStr) {
        const user = JSON.parse(userStr);
        token = user.token;
    }
      const res = await axios.get(`${API_URL}/api/taskFilters/cancelled`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true
          });
          console.log("cancelled", res.data);

      return res.data;
  };
  // משימות מגירה
export const fetchDrawer = async () => {
    const userStr = localStorage.getItem('user');

    let token = null;
    if (userStr) {
        const user = JSON.parse(userStr);
        token = user.token;
    }
      const res = await axios.get(`${API_URL}/api/taskFilters/drawer`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true
          });
          console.log("drawer", res.data);

      return res.data;
  };
  


  

