import axios from 'axios';
const API_URL = process.env.REACT_APP_BACKEND_URL;

export const updateTaskStatus = async (taskId, status, token) => {
    console.log("sta",status)
    const response = await axios.put(`${API_URL}/api/update/updateTask/${taskId}`, {status},{
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
export const updateRecurringStatus = async (taskId, status, token ) => {
    const response = await axios.put(`${API_URL}/api/updateToday/completeRecurringTask/${taskId}`, {status},{
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    });

    return response.data;
};

export const updateRecurringTask = async (taskId, preparedForm, token) => {
    console.log("preparedForm" ,preparedForm)
    const response = await axios.put(`${API_URL}/api/update/updateRecurringTask/${taskId}`, {preparedForm},{
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    });

    return response.data;
};

