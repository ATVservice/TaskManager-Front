import React, { useEffect, useRef, useState } from 'react';
import SimpleAgGrid from '../../components/simpleAgGrid/SimpleAgGrid.jsx'
import { getRecurringTaskHistory, getTaskHistory } from '../../services/historyService.js';
import { AuthContext } from '../../context/AuthContext.jsx';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import './History.css';
import { Clock } from 'lucide-react';

const History = () => {
    const { taskId, model } = useParams();
    const { user } = useContext(AuthContext);

    const [data, setData] = useState([]);

    const [columns] = useState([
        {
            headerName: 'שם משתמש',
            field: 'userName',
            minWidth: 120,
            flex: 1,
            valueGetter: (params) => params.data.user?.userName || ''
        },
        {
            headerName: 'שדה ששונה',
            field: 'field',
            minWidth: 120,
            flex: 1
        },
        {
            headerName: 'לפני שינוי',
            field: 'before',
            minWidth: 150,
            flex: 1
        },
        {
            headerName: 'לאחר שינוי',
            field: 'after',
            minWidth: 150,
            flex: 1
        },
        {
            headerName: "תאריך",
            field: 'date',
            width: 180,
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
   
    
     
   
    ]);

    useEffect(() => {
        const GetHistory = async () => {
            const token = user?.token;
            if (!token) return;
            try {
                if (model == "Task") {
                    const [historyTask] = await Promise.all([
                        getTaskHistory(taskId, token, model),
                    ]);
                    setData(historyTask.history)
                } else {
                    const [historyTask] = await Promise.all([
                        getRecurringTaskHistory(taskId, token, model),
                    ]);
                    setData(historyTask.history)
                }
            } catch (err) {
                alert(err.response?.data?.message || 'שגיאה בטעינת ההיסטוריה');
            }
        };

        GetHistory();
    }, []);

    return (
        <div className="history-page-wrapper">
            <div className="history-header">
                    <Clock className="title-icon" size={20}/>
                
                <h2 className="history-title">היסטורייה</h2>
            </div>

            <div className="history-grid-container">
                <SimpleAgGrid rowData={data} columnDefs={columns} />
            </div>
        </div>
    );
};

export default History;