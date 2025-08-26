import axios from 'axios';
const API_URL = process.env.REACT_APP_BACKEND_URL;

export const fetchGeneralSummary = async (token) => {

    const res = await axios.get(`${API_URL}/api/adminDashboard/getGeneralSummary`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.data;
};