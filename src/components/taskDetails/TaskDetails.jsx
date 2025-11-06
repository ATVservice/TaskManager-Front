import React, { useEffect, useState } from 'react';
import { useContext } from "react";
import './TaskDetails.css';
import { addComment, getComments } from '../../services/commentService';
import { getMoreDetails } from '../../services/taskService';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import SimpleAgGrid from '../simpleAgGrid/SimpleAgGrid';
import EditTask from '../editTask/EditTask';
import { Pencil } from 'lucide-react';

const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'];
const months = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

const TaskDetails = ({ details: initialDetails, isOpen, onClose, onTaskUpdated }) => {
    const { user } = useContext(AuthContext);
    const [details, setDetails] = useState(initialDetails);
    const [data, setData] = useState([]);
    const [model, setModel] = useState("");
    const [ShowEditModal, setShowEditModal] = useState(false);

    const [selectedTask, setSelectedTask] = useState(null);
    const [taskType, setTaskType] = useState("single");
    const [dailyUpdate, setDailyUpdate] = useState(null);

    const handleClosePopupEdit = () => setShowEditModal(false);

    const [columns] = useState([
        {
            headerName: 'שם משתמש',
            field: 'userName',
            minWidth: 120,
            width: 150,  // רוחב קבוע במקום flex
            valueGetter: (params) => params.data.createdBy?.userName || ''
        },
        {
            headerName: 'תוכן ההערה',
            field: 'content',
            minWidth: 200,
            width: 400,  // רוחב קבוע
            cellRenderer: (params) => {
                return (
                    <div style={{ 
                        whiteSpace: 'normal', 
                        lineHeight: '1.5',
                        padding: '8px 0',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                    }}>
                        {linkifyText(params.value)}
                    </div>
                );
            },
            wrapText: true,
            autoHeight: true,
            cellStyle: { 
                whiteSpace: 'normal',
                lineHeight: '1.5'
            }
        },
        {
            headerName: "תאריך",
            field: 'createdAt',
            width: 150,  // רוחב קבוע במקום 180
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

    const linkifyText = (text) => {
        if (!text) return '';

        // ביטוי רגולרי לזיהוי URLs
        const urlRegex = /(https?:\/\/[^\s]+)/g;

        // פיצול הטקסט לפי URLs
        const parts = text.split(urlRegex);

        return parts.map((part, index) => {
            // אם זה URL, החזר אותו כקישור
            if (part.match(urlRegex)) {
                return (
                    <a
                        key={index}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#0066cc', textDecoration: 'underline' }}
                    >
                        {part}
                    </a>
                );
            }
            // אחרת, החזר טקסט רגיל
            return <span key={index}>{part}</span>;
        });
    };

    // עדכון ה-details כש-initialDetails משתנה
    useEffect(() => {
        setDetails(initialDetails);
    }, [initialDetails]);

    useEffect(() => {
        const getAllComments = async () => {
            const token = user?.token;
            if (!token || !details?._id) return;

            const currentModel = details.frequencyType ? "recurring" : "task";

            try {
                const comments = await getComments(details._id, currentModel, token);
                setData(comments.comments);
                setModel(currentModel);
            } catch (err) {
                toast.error(err.response?.data?.message || "שגיאה, נסה מאוחר יותר", { duration: 3000 });
                console.log(err);
            }
        };

        getAllComments();
    }, [details, user]);

    if (!isOpen) return null;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('he-IL');
    };

    const toEdit = () => {
        console.log('toEdit called with task:', details);
        const canEditTask = user.id === details.creator || user.id === details.creator?._id || user.id === details.mainAssignee?._id || user.id === details.mainAssignee || user.role === 'מנהל';
        if (canEditTask) {
            setShowEditModal(true);
            setSelectedTask(details);
            setTaskType(details.frequencyType || details.isRecurringInstance ? "recurring" : "single");
        } else {
            toast.error("אין לך הרשאה לערוך משימה זו!", { duration: 3000 });
        }
    };

    const handleTaskUpdated = async () => {
        setShowEditModal(false);

        // טען מחדש את הפרטים המעודכנים של המשימה
        const token = user?.token;
        try {
            const updatedDetails = await getMoreDetails(details._id, token);
            setDetails(updatedDetails);
        } catch (error) {
            console.error('שגיאה בטעינת פרטים מעודכנים:', error);
        }

        // קריאה ל-callback מהרכיב האב כדי לרענן את המשימות
        if (onTaskUpdated) {
            onTaskUpdated();
        }
    };

    const creatComment = async () => {
        const { value: content, isConfirmed } = await Swal.fire({
            title: 'הוספת הערה',
            input: 'text',
            inputLabel: 'הקלד/י את תוכן ההערה',
            showCancelButton: true,
            confirmButtonText: 'הוסף',
            cancelButtonText: 'בטל',
            customClass: {
                container: 'swal-container'
            }
        });

        try {
            if (isConfirmed) {
                await addComment(details._id, model, content, user?.token);
                toast.success("נוספה הערה", { duration: 3000 });

                const comments = await getComments(details._id, model, user?.token);
                setData(comments.comments);
            }
        }
        catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "לא ניתן להוסיף הערה כרגע", { duration: 3000 });
        }
    }

    const renderFrequencyDetails = () => {
        if (!details.frequencyType) return null;

        switch (details.frequencyType) {
            case 'יומי':
                return (
                    <p>
                        <strong>
                            {details.frequencyDetails?.includingFriday ? "ימים א - ו" : "ימים א - ה"}
                        </strong>
                    </p>
                );

            case 'יומי פרטני':
                return (
                    <div className="frequency-tags">
                        <strong>ימים: </strong>
                        <div className="days-tags">
                            {details.frequencyDetails?.days?.map((dayIndex, index) => (
                                <span key={index} className="day-tag">
                                    {daysOfWeek[dayIndex]}
                                </span>
                            ))}
                        </div>
                    </div>
                );

            case 'חודשי':
                return (
                    <p>
                        <strong>יום בחודש: {details.frequencyDetails?.dayOfMonth}</strong>
                    </p>
                );

            case 'שנתי':
                return (
                    <>
                        <p><strong>יום: {details.frequencyDetails?.day}</strong></p>
                        <p><strong>חודש: {months[details.frequencyDetails?.month - 1]}</strong></p>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div className="side-popup" style={{ width: '80vw', maxWidth: '900px' }}>
            <button className="close-btn" onClick={onClose}>X</button>
            <h3>פרטים נוספים</h3>

            <div className="task-details-grid">
                {details.details && <p><strong>פרטי משימה: </strong>{details.details}</p>}
                {details.project && <p><strong>פרויקט: </strong>{details.project.name}</p>}
                {details.assignees && details.assignees.length > 0 && (
                    <p><strong>אחראים: </strong>{details.assignees.map(a => a.userName).join(', ')}</p>
                )}
                {details.importance && <p><strong>חשיבות: </strong>{details.importance}</p>}
                {details.subImportance && <p><strong>תת דירוג: </strong>{details.subImportance}</p>}
                {details.statusNote && <p><strong>עדכון מצב: </strong>{details.statusNote}</p>}
                {details.creator?.userName && <p><strong>יוצר משימה: </strong>{details.creator.userName}</p>}
                {details.daysOpen !== undefined && <p><strong>ימים מאז פתיחה: </strong>{details.daysOpen}</p>}
                {details.dueDate && <p><strong> תאריך משימה: </strong>{formatDate(details.dueDate)}</p>}
                {details.finalDeadline && <p><strong>תאריך יעד סופי: </strong>{formatDate(details.finalDeadline)}</p>}
                {details.failureReason?.option && details.failureReason.option !== "אחר" && (
                    <p><strong>סיבת אי ביצוע: </strong>{details.failureReason.option}</p>
                )}
                {details.failureReason?.option === "אחר" && (
                    <p><strong>סיבת אי ביצוע: </strong>{details.failureReason.customText}</p>
                )}

                {details.cancelReason && (
                    <p><strong>סיבת ביטול: </strong>{details.cancelReason}</p>
                )}

                {details.frequencyType && (
                    <>
                        <p><strong>סוג תדירות: </strong>{details.frequencyType}</p>
                        {renderFrequencyDetails()}
                    </>
                )}
            </div>

            <div className="comment-section">
                <div className="action-buttons">
                    <button className="add-comment-btn" onClick={creatComment}>
                        הוסף הערה
                    </button>
                    <button className="add-comment-btn" onClick={toEdit}>
                        <Pencil size={16} />
                        <span>ערוך משימה</span>
                    </button>
                </div>

                <SimpleAgGrid rowData={data} columnDefs={columns} />

                {ShowEditModal && (
                    <div className="popup-overlay">
                        <div className="popup-content">
                            <button onClick={handleClosePopupEdit} className="close-btn close-edit">×</button>
                            <EditTask
                                taskToEdit={selectedTask}
                                dailyUpdate={dailyUpdate}
                                taskType={taskType}
                                onClose={handleClosePopupEdit}
                                onTaskUpdated={handleTaskUpdated}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskDetails;