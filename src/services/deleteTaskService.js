import api from './api.js'

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const fetchDeleteTask = async (token, password, taskId, isTodayTask) => {
    console.log("ttt",token)
 
      const res = await api.put(`${API_URL}/api/delete/softDeleteTask/${taskId}/${isTodayTask}`,{password}, {
       
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true
          });
      return res.data;
  };