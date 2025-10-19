import React, { useEffect, useState } from 'react';
import { useContext } from "react";
import './TaskDetails.css';
import { addComment, getComments } from '../../services/commentService';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import SimpleAgGrid from '../simpleAgGrid/SimpleAgGrid';

const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'];
const months = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

const TaskDetails = ({ details, isOpen, onClose }) => {
    const { user } = useContext(AuthContext);
    const [data, setData] = useState([]);
    const [model, setModel] = useState("");


    const [columns] = useState([
        {
            headerName: 'שם משתמש',
            field: 'userName',
            minWidth: 120,
            flex: 1,
            valueGetter: (params) => params.data.createdBy?.userName || ''
        },
        {
            headerName: 'תוכן ההערה',
            field: 'content',
            minWidth: 150,
            flex: 1
        },
        {
            headerName: "תאריך",
            field: 'createdAt',
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
        const getAllComments = async () => {
            const token = user?.token;
            if (!token) return;

            const currentModel = details.frequencyType ? "recurring" : "task";

            try {
                const comments = await getComments(details._id, currentModel, token);
                setData(comments.comments);
                setModel(currentModel); // אם עדיין רוצים לשמור ב-state
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
        // <div className={`side-popup ${!isOpen ? 'hidden' : ''}`}>
        <div className="side-popup" style={{ width: '80vw', maxWidth: '900px' }}>

            <button className="close-btn" onClick={onClose}>X</button>
            <h3>פרטים נוספים</h3>


            {/* פרטים נוספים ב-Grid */}
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
                {details.failureReason?.option && details.failureReason.option != "אחר" && (
                    <p><strong>סיבת אי ביצוע: </strong>{details.failureReason.option}</p>
                )}
                {details.failureReason?.option == "אחר" && (
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
                <button className="add-comment-btn" onClick={creatComment}>הוסף הערה</button>
                <SimpleAgGrid rowData={data} columnDefs={columns} />
            </div>

        </div>
    );

};

export default TaskDetails;