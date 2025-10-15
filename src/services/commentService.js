import api from './api.js'


const API_URL = process.env.REACT_APP_BACKEND_URL;
export const addComment = async (_id, type, content, token) => {

  const response = await api.post(`${API_URL}/api/comment/addComment`, { _id, type, content },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true
    });
  return response.data;
};
export const getComments = async (_id, type, token) => {
  const response = await api.get(`${API_URL}/api/comment/getComments?_id=${_id}&type=${type}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true
    });
  return response.data;
};