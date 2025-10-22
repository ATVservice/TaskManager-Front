import React, { useContext, useEffect, useState } from 'react';
import { fetchUserAlerts, markAlertsRead } from '../../services/alertService';
import './AlertsPage.css';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Title } from 'react-head';
import { useNavigate } from 'react-router-dom';
import { AlertContext } from '../../context/AlertContext';
import { getMoreDetails } from '../../services/taskService';
import { fetchGetDeletedTasks } from '../../services/restoreService';
import { startOfDay } from 'date-fns';


const AlertsPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const alertsPerPage = 5;
    const { updateUnreadCount } = useContext(AlertContext);


    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const data = await fetchUserAlerts(user?.token, { sortBy: 'createdAt', order: 'desc' });
                let list = data.alerts || [];
                list.sort((a, b) => {
                    if (a.resolved === b.resolved) {
                        return new Date(b.createdAt) - new Date(a.createdAt); // חדש קודם
                    }
                    return a.resolved ? 1 : -1; // לא נקראו לפני נקראו
                });
                setAlerts(list);
            } catch (err) {
                toast.error(err.response?.data?.message, { duration: 3000 });
                console.error(err);
            }
        };
        fetchAlerts();
    }, [user?.token]);

    // פונקציה לסימון התרעה בודדת כנקראה
    const markAsRead = async (alertId) => {
        try {
            await markAlertsRead(user.token, [alertId]);
            setAlerts(prev =>
                prev.map(a => (a._id === alertId ? { ...a, resolved: true } : a))
            );
            // updateUnreadCount(0);
            updateUnreadCount(prev => Math.max(prev - 1, 0));


        } catch (err) {
            toast.error(err.response?.data?.message, { duration: 3000 });
            console.error('Failed to mark alert as read', err);
        }
    };

    const handleTaskClick = async (taskId) => {    
        try {
            const task = await getMoreDetails(taskId, user?.token);
            if (!task) {
                toast.error("לא ניתן לטעון את המשימה");
                return;
            }
    
            if (!task.isDeleted) {
                let tab = '';
                let subType = null;

                const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    
                const israelNow = new Date(
                  new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" })
                );
                const todayStart = startOfDay(israelNow);
                
                if (dueDate && dueDate < todayStart && task.status !== 'הושלם' && task.status !== 'בוטלה') {
                    tab = 'open';
                }
                
                else if (dueDate && dueDate > israelNow) {
                    tab = 'future';
                } 
                else {
                    if (task.status === 'הושלם') {
                        tab = 'completed';
                    } else if (task.status === 'בוטלה') {
                        tab = 'cancelled';
                    } else if (task.importance === 'מגירה') {
                        tab = 'drawer';
                    } else if (task.frequencyType) {
                        if (task.taskModel === 'TodayTask' || task.isRecurringInstance) {
                            tab = 'today';
                            subType = 'today-recurring';
                        } else {
                            tab = 'recurring';
                        }
                    } else {
                        tab = 'today';
                        subType = 'today-single';
                    }
                }
    
                // שמירת הדגשה
                sessionStorage.setItem("highlightedTaskId", taskId);
                sessionStorage.setItem("highlightedTaskTab", tab);
    
                if (subType) {
                    sessionStorage.setItem("highlightedTaskType", subType);
                }
    
                navigate(`/tasks/${taskId}`);
                return;
            }
    
            const deletedTasks = await fetchGetDeletedTasks(user?.token);
    
            if (Array.isArray(deletedTasks)) {
                const found = deletedTasks.find(t => t._id === taskId);
                if (found) {
                    sessionStorage.setItem("highlightedTaskId", taskId);
                    navigate("/recyclingBin");
                    return;
                }
            }
    
            toast.error("המשימה נמחקה לצמיתות");
        } catch (err) {
            console.error("שגיאה בטעינת משימה:", err);
            toast.error("לא ניתן לטעון את המשימה");
        }
    };
      

    // חישוב דפים
    const indexOfLast = currentPage * alertsPerPage;
    const indexOfFirst = indexOfLast - alertsPerPage;
    const currentAlerts = alerts.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(alerts.length / alertsPerPage);

    return (
        <>
            <Title>התראות</Title>

            <div className="alerts-container">
                <h1>כל ההתראות</h1>
                <ul className="alerts-all">
                    {currentAlerts.map(alert => (
                        <li key={alert._id} className={`alert-single ${alert.resolved ? 'resolved' : ''}`}>
                            <div className="alert-type">{alert.type}</div>

                            {alert.task ? (
                                alert.task.taskId ? (
                                    <div className="alert-task">
                                        <span
                                            className="alert-title"
                                            style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                                            onClick={() => handleTaskClick(alert.task._id || alert.task.taskId)}
                                        >
                                            משימה מס' {alert.task.taskId}: {alert.task.title}                                    </span>

                                    </div>
                                ) : (
                                    <div className="alert-task">
                                        <span
                                            className="alert-title"
                                            style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                                            onClick={() => handleTaskClick(alert.task._id || alert.task.taskId)}
                                        >
                                            משימה: {alert.task.title}
                                        </span>
                                    </div>
                                )
                            ) : (
                                <div className="alert-task no-task">
                                </div>
                            )}

                            <div className="alert-date">
                                נוצרה: {new Date(alert.createdAt).toLocaleDateString('he-IL')}
                            </div>

                            {alert.details && <div className="alert-details">{alert.details}</div>}
                            {!alert.resolved && (
                                <button
                                    className="mark-read-btn"
                                    onClick={() => markAsRead(alert._id)}
                                >
                                    סמן כנקראה
                                </button>
                            )}
                        </li>
                    ))}

                </ul>

                <div className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={currentPage === i + 1 ? 'active' : ''}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
};

export default AlertsPage;
