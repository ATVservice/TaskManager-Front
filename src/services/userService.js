import axios from 'axios';
const API_URL = process.env.REACT_APP_BACKEND_URL;
export const getUserNames = async () => {
    const userStr = localStorage.getItem('user');

    let token = null;
    if (userStr) {
        const user = JSON.parse(userStr);
        token = user.token;
    }
    const response = await axios.get(`${API_URL}/api/users/getUserNamesEmployees`,
      {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true
      });
      console.log("response", response.data);
    return response.data;
  };
