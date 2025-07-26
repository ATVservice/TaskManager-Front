import axios from 'axios';
const API_URL = process.env.REACT_APP_BACKEND_URL;

export const fetchAllAssociations = async () => {
    const userStr = localStorage.getItem('user');

    let token = null;
    if (userStr) {
        const user = JSON.parse(userStr);
        token = user.token;
    }
    console.log("token", token);

    const res = await axios.get(`${API_URL}/api/associations/getAllAssociations`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.data;
};
export const fetchGetAssociatedEmployees = async (associationId) => {
    const userStr = localStorage.getItem('user');

    let _id = null;
    let token = null;
    if (userStr) {
        const user = JSON.parse(userStr);
        _id = user.id;
        token = user.token
    }
    console.log("associationId", associationId);

    const res = await axios.get(`${API_URL}/api/associations/getAssociated/${associationId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.data;
};
