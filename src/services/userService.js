import axios from 'axios';
const API_URL = process.env.REACT_APP_BACKEND_URL;
export const getUserNames = async (token) => {

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
export const getNames = async (token) => {

  const response = await axios.get(`${API_URL}/api/users/getNamesEmployees`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true
    });
  console.log("response", response.data);
  return response.data;
};
export const getAllEmployees = async (token) => {

  const response = await axios.get(`${API_URL}/api/users/getAllEmployees`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true
    });
  console.log("response", response.data);
  return response.data;
};
export const updateUser = async (id, updates, token) => {

  const response = await axios.put(`${API_URL}/api/users/updateUser/${id}`, updates,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true
    });

  return response.data;
};
export const deleteUser = async (id, token) => {

  const response = await axios.delete(`${API_URL}/api/users/deleteUser/${id}`, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true
    });

  return response.data;
};