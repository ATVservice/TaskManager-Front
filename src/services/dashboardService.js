import axios from 'axios';
const API_URL = process.env.REACT_APP_BACKEND_URL;

export async function getPerformance({ rangeType, from, to, groupBy, token }) {
    try {
        const params = new URLSearchParams();

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

        const res = await fetch(`${API_URL}/api/dashboard/getUserPerformance?${params.toString()}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true
        });

        if (!res.ok) throw new Error("שגיאה בטעינת הנתונים");
        return await res.json();
    } catch (err) {
        console.error(err);
        throw err;
    }
}

