import api from './api.js'

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const fetchGeneralSummary = async (token, filterOptions = {}) => {
    const params = new URLSearchParams();
    
    if (filterOptions.filterType) {
        params.append('filterType', filterOptions.filterType);
    }
    
    if (filterOptions.startDate) {
        params.append('startDate', filterOptions.startDate);
    }
    
    if (filterOptions.endDate) {
        params.append('endDate', filterOptions.endDate);
    }
    
    const url = `${API_URL}/api/adminDashboard/getGeneralSummary${params.toString() ? `?${params.toString()}` : ''}`;
    
    const res = await api.get(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    console.log(res.data)

    return res.data;
};