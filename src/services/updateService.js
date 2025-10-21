import api from './api.js'
const API_URL = process.env.REACT_APP_BACKEND_URL;

export const updateTaskStatus = async (taskId, status, token) => {
    console.log("sta",status)
    const response = await api.put(`${API_URL}/api/update/updateTask/${taskId}`, {status},{
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    });

    return response.data;
};
export const updateTask = async (taskId, preparedForm,dailyUpdate, token) => {
    const body = {
        preparedForm,
        isDailyUpdate: dailyUpdate  // <-- כאן
    };
    console.log("preparedForm" ,preparedForm)
    const response = await api.put(`${API_URL}/api/update/updateTask/${taskId}`, body,{
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    });

    return response.data;
};
export const updateRecurringStatus = async (taskId, status, token ) => {
    const response = await api.put(`${API_URL}/api/updateToday/completeRecurringTask/${taskId}`, {status},{
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    });

    return response.data;
};
export const updateRecurringTask = async (taskId, preparedForm,dailyUpdate, token) => {
    const body = {
        preparedForm,
        isDailyUpdate: dailyUpdate  // <-- כאן
    };
    console.log("preparedForm" ,preparedForm)
    const response = await api.put(`${API_URL}/api/update/updateRecurringTask/${taskId}`,body ,{
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    });

    return response.data;
};

