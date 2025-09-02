import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;
export const fetchAddProject = async (name, token) => {

  const response = await axios.post(`${API_URL}/api/project/addProject`, { name },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true
    });
  return response.data;
};
export const fetchGetAllProjectNames = async (token) => {

  const response = await axios.get(`${API_URL}/api/project/getAllProjectNames`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true
    });
    console.log("response.data", response.data);
  return response.data;
};