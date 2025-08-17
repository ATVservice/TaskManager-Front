import React, { useEffect, useRef, useState } from 'react';
import SimpleAgGrid from '../../components/simpleAgGrid/SimpleAgGrid.jsx'
import { getTaskHistory } from '../../services/historyService.js';
import { AuthContext } from '../../context/AuthContext.jsx';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';


const History = () => {
    const { taskId } = useParams();
    const { user } = useContext(AuthContext);

    const [data, setData] = useState([]);

    const [columns] = useState([

        {
            headerName: "תאריך", field: 'date',
            valueFormatter: (params) => {
                if (!params.value) return '';
                return new Date(params.value).toLocaleString('he-IL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        },
        {
            headerName: 'שם משתמש',
            valueGetter: (params) => params.data.user?.userName || ''
        },
        { headerName: 'שדה ששונה', field: 'field' },
        { headerName: 'לאחר שינוי', field: 'after' },
        { headerName: 'לפני שינוי', field: 'before' },

    ]);

    useEffect(() => {
        const GetHistory = async () => {
            const token = user?.token;
            if (!token) return;
            try {
                const [historyTask] = await Promise.all([
                    getTaskHistory(taskId, token),
                ]);

                setData(historyTask.history)
            } catch (err) {
                alert(err.response?.data?.message || 'שגיאה בטעינת ההיסטוריה');
            }
        };

        GetHistory();
    }, []);

    return (
        <div>
            <h2>היסטוריה</h2>
            <SimpleAgGrid rowData={data} columnDefs={columns} />
        </div>
    );
};

export default History;
