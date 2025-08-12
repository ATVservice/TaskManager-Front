import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;
export const createGoal = async (formData, token) => {
  console.log("formData", formData);

  const response = await axios.post(`${API_URL}/api/goal/createGoal`, { formData },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true
    });
  return response.data;
};