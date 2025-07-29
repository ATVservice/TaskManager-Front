import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;
export const createTask = async (form) => {
  console.log("form", form);
  const userStr = localStorage.getItem('user');

  let token = null;
  if (userStr) {
    const user = JSON.parse(userStr);
    token = user.token;
  }
  const response = await axios.post(`${API_URL}/api/tasks/createTask`, { form },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true
    });
  return response.data;
};
export const getTasks = async (token) => {
  const response = await axios.get(`${API_URL}/api/tasks/getTasks`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true
    });
  console.log("response", response.data);
  return response.data;
};
export const getMoreDetails = async (_id) => {
  const userStr = localStorage.getItem('user');

  let token = null;
  if (userStr) {
    const user = JSON.parse(userStr);
    token = user.token;
  }
  const response = await axios.get(`${API_URL}/api/tasks/getMoreDetails/${_id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true
    });
  console.log("details", response.data);
  return response.data;
};
export const duplicateTask = async (taskId) => {
  const userStr = localStorage.getItem('user');

  let token = null;
  if (userStr) {
    const user = JSON.parse(userStr);
    token = user.token;
  }
  const response = await axios.post(`${API_URL}/api/tasks/duplicateTask `, { taskId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true
    });
  return response.data;
};


