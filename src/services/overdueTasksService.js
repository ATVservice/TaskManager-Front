import api from './api.js'

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const getOverdueTasks = async (token) => {
  const response = await api.get(`${API_URL}/api/overdueTasks/getOverdueTasks`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true
    });
    console.log("response.data in getOverdueTasks:", response.data);
  return response.data;
};
export const fetchUpdateStatusDelayed = async (token, status, model, taskId) => {

  const response = await api.put(`${API_URL}/api/overdueTasks/updateStatusDelayed/${taskId}`,{model,status},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true
    });
  return response.data;
};
export const fetchUpdatedueDate = async (token, dueDate, finalDeadline, model, taskId) => {

  const response = await api.put(`${API_URL}/api/overdueTasks/updatedueDate/${taskId}`,{model, dueDate, finalDeadline},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true
    });
  return response.data;
};