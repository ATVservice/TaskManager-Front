import axios from 'axios';
const API_URL = process.env.REACT_APP_BACKEND_URL;


export const loginUser = async (username, password) => {
  const response = await axios.post(`${API_URL}/api/auth/login`, { userName: username, password },

    {
      method: 'POST',
      withCredentials: true
    });

  return response.data;
};
export const registerUser = async (userName, firstName, lastName, password, email, role, token) => {

  const response = await axios.post(`${API_URL}/api/auth/register`, { userName, firstName, lastName, password, email, role },
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true
    });

  return response.data;
};
export const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/api/auth/forgotPassword`, {email},
    {
      method: 'POST',
      withCredentials: true
    });

  return response.data;
};
export const resetPassword = async (token, newPassword) => {
  const response = await axios.post(`${API_URL}/api/auth/resetPassword`, {token, newPassword},
    {
      method: 'POST',
      withCredentials: true
    });

  return response.data;
};