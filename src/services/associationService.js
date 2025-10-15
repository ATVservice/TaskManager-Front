import api from './api.js'

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const fetchAllAssociations = async (token) => {


    const res = await api.get(`${API_URL}/api/associations/getAllAssociations`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.data;
};
export const fetchGetAssociatedEmployees = async (associationId, token) => {


    const res = await api.get(`${API_URL}/api/associations/getAssociated/${associationId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.data;
};
export const updateAssociationUsers = async (body, token) => {
    console.log("token", token)
    console.log("addAssociatedEmployees", body)
    const res = await api.put(`${API_URL}/api/associations/updateAssociationUsers`,
        body,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
        });
    return res.data;
};
export const createAssociation = async (name,   description, token) => {

    const res = await api.post(`${API_URL}/api/associations/createAssociation`,
        {name, description},
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
        });
    return res.data;
};
