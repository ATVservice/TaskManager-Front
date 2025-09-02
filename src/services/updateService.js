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
export const updateTask = async (taskId, preparedForm, token) => {
    console.log("preparedForm" ,preparedForm)
    const response = await axios.put(`${API_URL}/api/update/updateTask/${taskId}`, {preparedForm},{
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    });

    return response.data;
};
export const updateRecurringStatus = async (taskId, status, token, content ) => {
    const response = await axios.put(`${API_URL}/api/updateToday/completeRecurringTask/${taskId}`, {status, content },{
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    });

    return response.data;
};

