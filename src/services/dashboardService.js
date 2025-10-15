import api from './api.js'

const API_URL = process.env.REACT_APP_BACKEND_URL;

export async function getPerformance({ employeeId, rangeType, from, to, groupBy, token }) {
    try {
        const params = new URLSearchParams();

        if (employeeId) {
            params.append('employeeId', employeeId); 
        }

        if (from && to) {
            // טווח מותאם
            params.append('from', from);
            params.append('to', to);
        } else if (rangeType) {
            const rangeTypeMap = {
                'יום': 'day',
                'שבוע': 'week',
                'חודש': 'month',
                'שנה': 'year'
            };

            const mappedRangeType = rangeTypeMap[rangeType] || rangeType;
            params.append('rangeType', mappedRangeType .toLowerCase());
        }

        if (groupBy) {
            params.append('groupBy', groupBy);
        }


        const res = await api.get(`${API_URL}/api/dashboard/getUserPerformance`, {
            params, 
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true
        });

        return await res.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

