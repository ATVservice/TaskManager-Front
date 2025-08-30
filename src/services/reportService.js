import axios from 'axios';
const API_URL = process.env.REACT_APP_BACKEND_URL;

export const getOpenTasksByEmployee= async (token, filters) => {

    const res = await axios.get(`${API_URL}/api/report/getOpenTasksByEmployee`, {
        params: filters,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.data;
};

export const getTasksByResponsibility= async (token, filters) => {

    const res = await axios.get(`${API_URL}/api/report/getTasksByResponsibility`, {
        params: filters,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.data;
};

export const getOverdueTasks= async (token, filters) => {

    const res = await axios.get(`${API_URL}/api/report/getOverdueTasks`, {
        params: filters,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.data;
};

export const getTasksSummaryByPeriod= async (token, filters) => {

    const res = await axios.get(`${API_URL}/api/report/getTasksSummaryByPeriod`, {
        params: filters,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.data;
};

export const getEmployeePersonalStats= async (token, filters) => {

    const res = await axios.get(`${API_URL}/api/report/getEmployeePersonalStats`, {
        params: filters,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.data;
};
export const getTasksByFailureReason = async (token, filters) => {

    const res = await axios.get(`${API_URL}/api/report/getTasksByFailureReason`, {
        params: filters,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.data;
};




