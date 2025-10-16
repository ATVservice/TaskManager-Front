// TaskRedirect.jsx
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMoreDetails } from '../../services/taskService';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';

const TaskRedirect = () => {
    const { user } = useContext(AuthContext);
    const { id } = useParams();
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!user) return; // אם אין user – לא לבדוק בכלל
      
        const checkTask = async () => {
            setChecking(true);
            try {
                const task = await getMoreDetails(id, user.token);
      
                if (!task || task.isDeleted || task.isArchived) {
                    setNotFound(true); // כאן מפסיקים, לא עושים navigate
                } else {
                    // ניווט רגיל
                    const tab = task.status === 'הושלם' ? 'completed'
                               : task.status === 'בוטלה' ? 'cancelled'
                               : task.frequencyType ? 'recurring' 
                               : task.importance === 'מגירה' ? 'drawer'
                               : 'today';
      
                    navigate(`/tasks/${id}?tab=${tab}`, { state: { highlightTaskId: id } });
                }
            } catch (err) {
                setNotFound(true);
            } finally {
                setChecking(false);
            }
        };
      
        checkTask();
      }, [id, navigate, user]);
      

    if (checking) return <p style={{ textAlign: 'center', marginTop: '100px' }}>טוען משימה...</p>;

    if (notFound) {
        return (
            <div style={{
                textAlign: 'center',
                marginTop: '120px',
                color: '#333',
                fontFamily: 'Heebo, sans-serif'
            }}>
                <h2 style={{ color: '#d9534f' }}>❌ המשימה לא נמצאה</h2>
                <p>ייתכן שהיא נמחקה, בוטלה או שאינה קיימת עוד במערכת.</p>
                <button
                    onClick={() => navigate('/tasks?tab=today')}
                    style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        marginTop: '20px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    חזרה למשימות
                </button>
            </div>
        );
    }

    return null;
};

export default TaskRedirect;
