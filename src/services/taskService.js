import axios from 'axios';
const API_URL = process.env.REACT_APP_BACKEND_URL;
export const createTask= async (form) => {
    const userStr = localStorage.getItem('user');

    let token = null;
    if (userStr) {
        const user = JSON.parse(userStr);
        token = user.token;
    }
    const response = await axios.post(`${API_URL}/api/tasks/createTask`,{form},
      {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true
      });
      console.log("response", response.data);
    return response.data;
  };
