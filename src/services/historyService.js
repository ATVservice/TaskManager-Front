import axios from 'axios';
const API_URL = process.env.REACT_APP_BACKEND_URL;

export const getTaskHistory = async (taskId, token, model) => {
    const response = await axios.get(`${API_URL}/api/update/history/${taskId}`, {
        params: { model }, 
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    });
    console.log(response.data);
    return response.data;
};
export const getRecurringTaskHistory = async (taskId, token) => {
    const response = await axios.get(`${API_URL}/api/update/recurringHistory/${taskId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    });
    console.log(response.data);
    return response.data;
};

