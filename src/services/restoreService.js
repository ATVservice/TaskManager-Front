import api from './api.js'
const API_URL = process.env.REACT_APP_BACKEND_URL;

export const fetchRestoreTask = async (token, password, taskId) => { 
      const res = await api.put(`${API_URL}/api/restore/restoreTask/${taskId}`,{password}, {
       
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true
          });
      return res.data;
  };
  export const fetchGetDeletedTasks = async (token) => { 
    const res = await api.get(`${API_URL}/api/restore/getAllDeletedTasks`, {
     
          headers: {
              Authorization: `Bearer ${token}`,
          },
          withCredentials: true
        });
        console.log('מערך למחזור',res.data)
    return res.data;
};