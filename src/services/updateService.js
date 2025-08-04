import axios from 'axios';
const API_URL = process.env.REACT_APP_BACKEND_URL;

export const updateTaskStatus = async (taskId, status, token,  statusNote = '') => {
    console.log("sta",status)
    const response = await axios.put(`${API_URL}/api/update/updateTask/${taskId}`, {status, statusNote},{
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    });

    return response.data;
};
