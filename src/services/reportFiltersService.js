import api from './api.js'

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const fetchLoadSavedFilter = async (screenType, token) => {
    try{
    const response = await api.get(`${API_URL}/api/report/loadSavedFilter/${screenType}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    });
    console.log(response.data);
    return response.data;
    }
    catch (error) {
        console.error('Error loading filter:', error);
        throw error;
    }
};

export const fetchResetFilter = async (screenType, token) => {
    try{
    const response = await api.delete(`${API_URL}/api/report/resetFilter/${screenType}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    });
    console.log(response.data);
    return response.data;
}
catch (error) {
    console.error('Error resetting filter:', error);
    throw error;
}
};

