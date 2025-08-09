import React, { useEffect, useRef, useState } from 'react';
import './AlertsDrawer.css';
import { fetchUserAlerts, markAlertsRead } from '../../services/alertService';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import he from 'date-fns/locale/he';

const AlertsDrawer = ({ open, onClose, token, onMarkedRead }) => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);
    const markedOnce = useRef(false);

    const loadAlerts = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const data = await fetchUserAlerts(token, { limit: 50, sortBy: 'createdAt', order: 'desc' });
            let list = data.alerts || [];
            list.sort((a, b) => {
                if (a.resolved === b.resolved) {
                    return new Date(b.createdAt) - new Date(a.createdAt); // חדש קודם
                }
                return a.resolved ? 1 : -1; // לא נקראים לפני נקראים
            });
            setAlerts(list);
        } catch (err) {
            alert(err.response?.data?.message || 'שגיאה בטעינת התרעות');
            console.error('Error loading alerts', err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (open) {
            markedOnce.current = false;
            loadAlerts();
        }
    }, [open]);


const markAllAsRead = async () => {
    if (!token) return;
    const toMark = alerts.filter(a => !a.resolved).map(a => a._id);
    if (toMark.length === 0) return;

    try {
        await markAlertsRead(token, toMark);
        setAlerts(prev => prev.map(a => toMark.includes(a._id) ? { ...a, resolved: true } : a));
        if (onMarkedRead) onMarkedRead();
    } catch (err) {
        alert(err.response?.data?.message || 'שגיאה בסימון התרעה');
        console.error('Failed to mark alerts read', err);
    }
};

const handleClose = () => {
    markAllAsRead();
    onClose();
};


    const unreadCount = alerts.filter(a => !a.resolved).length;

    return (
        <div className={`alerts-drawer ${open ? 'open' : ''}`} role="dialog" aria-hidden={!open}>
            <div className="alerts-header">
                <h3>התרעות ({unreadCount})</h3>
                <button className="close-drawer"  onClick={handleClose}>X</button>
            </div>

            <div className="alerts-list">
                {loading && <div className="alerts-loading">טוען...</div>}
                {!loading && alerts.length === 0 && <div className="no-alerts">אין התרעות</div>}

                {alerts.map((a) => {
                    const task = a.task || {};
                    const titleLine = `משימה ${task.taskId || ''} - ${task.title || '—'}`;
                    const typeLine = a.type || '';
                    const timeAgo = a.createdAt ? formatDistanceToNowStrict(parseISO(a.createdAt), { locale: he, addSuffix: true }) : '';

                    return (
                        <div key={a._id} className={`alert-item ${a.resolved ? 'read' : 'unread'}`}>
                            <div className="left-indicator">
                                <div className="avatar-circle">{(task.taskId || '?') % 100}</div>
                            </div>
                            <div className="alert-body">
                                <div className="alert-top">
                                    <span className="alert-title">{titleLine}</span>
                                    <span className="alert-time">{timeAgo}</span>
                                </div>
                                <div className="alert-type">{typeLine}</div>
                                {a.details && <div className="alert-details">{a.details}</div>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AlertsDrawer;
