import React, { useContext, useEffect, useState } from 'react';
import { fetchUserAlerts, markAlertsRead } from '../../services/alertService';
import './AlertsPage.css';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Title } from 'react-head';

const AlertsPage = () => {
    const { user } = useContext(AuthContext);

    const [alerts, setAlerts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const alertsPerPage = 5;

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
        } catch (err) {
            toast.error(err.response?.data?.message, { duration: 3000 });
            console.error('Failed to mark alert as read', err);
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
                                        משימה מס' {alert.task.taskId}: {alert.task.title}
                                    </div>
                                ) : (
                                    <div className="alert-task">
                                        משימה: {alert.task.title}
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
