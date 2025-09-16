import React, { useEffect, useRef, useState } from 'react';
import './AlertsDrawer.css';
import { fetchUserAlerts, markAlertsRead } from '../../services/alertService';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import he from 'date-fns/locale/he';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AlertsDrawer = ({ open, onClose, token, onMarkedRead }) => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);
    const markedOnce = useRef(false);
    const navigate = useNavigate();

    const loadAlerts = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const data = await fetchUserAlerts(token, { limit: 10, sortBy: 'createdAt', order: 'desc' });
            let list = data.alerts || [];
            list.sort((a, b) => {
                if (a.resolved === b.resolved) {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                return a.resolved ? 1 : -1;
            });
            setAlerts(list);
        } catch (err) {
            toast.error(err.response?.data?.message || 'לא ניתן לטעון התרעות כרגע', { duration: 3000 });
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
            console.error('Failed to mark alerts read', err);
        }
    };

    const handleClose = () => {
        markAllAsRead();
        onClose();
    };

    const seeAllAlerts = () => {
        handleClose()
        navigate('/allAlerts', { target: '_blank' });
    }

    return (
        <div className={`alerts-drawer ${open ? 'open' : ''}`} role="dialog" aria-hidden={!open}>
            <div className="alerts-header">
                <h3>התראות</h3>
                <a
                    onClick={(e) => {
                        e.preventDefault();
                        seeAllAlerts();
                    }}
                    className='allAlerts'

                    href="#"
                >
                    לכל התראות
                </a>
                <button className="close-drawer" onClick={handleClose}>X</button>
            </div>

            <div className="alerts-list">
                {loading && <div className="alerts-loading">טוען...</div>}
                {!loading && alerts.length === 0 && <div className="no-alerts">אין התראות</div>}

                {alerts.map((a) => {
                    const task = a.task || {};

                    const typeLine = a.type || '';
                    const timeAgo = a.createdAt ? formatDistanceToNowStrict(parseISO(a.createdAt), { locale: he, addSuffix: true }) : '';

                    return (
                        <div key={a._id} className={`alert-item ${a.resolved ? 'read' : 'unread'}`}>
                            <div className="left-indicator">
                                {task.taskId && <div className="avatar-circle">{(task.taskId || '?') % 100}</div>}
                            </div>
                            <div className="alert-body">
                                <div className="alert-top">
                                    <span className="alert-title">{task.title || ''}</span>
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
