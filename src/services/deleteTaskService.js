import axios from 'axios';
const API_URL = process.env.REACT_APP_BACKEND_URL;

export const fetchDeleteTask = async (token, password, taskId) => {
    console.log("ttt",token)
 
      const res = await axios.put(`${API_URL}/api/delete/softDeleteTask/${taskId}`,{password}, {
       
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true
          });
      return res.data;
  };