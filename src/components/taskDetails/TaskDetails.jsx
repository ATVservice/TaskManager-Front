import React from 'react';
import './TaskDetails.css';

const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'];
const months = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

const TaskDetails = ({ details, isOpen, onClose }) => {
    if (!isOpen) return null;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('he-IL');
    };

    const renderFrequencyDetails = () => {
        if (!details.frequencyType) return null;

        switch (details.frequencyType) {
            case 'יומי':
                return (
                    <p>
                        <strong>
                            {details.frequencyDetails?.includingFriday ? "'ימים א'-ו" : "'ימים א'-ה"}
                        </strong>
                    </p>
                );

            case 'יומי פרטני':
                return (
                    <>
                        <p><strong>ימים:</strong></p>
                        {details.frequencyDetails?.days?.map((dayIndex, index) => (
                            <p key={index}>
                                <strong>{daysOfWeek[dayIndex]}</strong>
                            </p>
                        ))}
                    </>
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
        <div className={`side-popup ${!isOpen ? 'hidden' : ''}`}>
            <button className="close-btn" onClick={onClose}>X</button>
            <h3>פרטים נוספים</h3>

            {details.details && (
                <p><strong>פרטי משימה: </strong>{details.details}</p>
            )}

            {details.project && (
                <p><strong>פרויקט: </strong>{details.project.name}</p>
            )}

            {details.assignees && details.assignees.length > 0 && (
                <>
                    <p><strong>אחראים:</strong></p>
                    {details.assignees.map((assignee, index) => (
                        <p key={index}>
                            <strong>{index + 1}.</strong> {assignee.userName}
                        </p>
                    ))}
                </>
            )}

            {details.importance && (
                <p><strong>חשיבות: </strong>{details.importance}</p>
            )}

            {details.subImportance && (
                <p><strong>תת דירוג: </strong>{details.subImportance}</p>
            )}

            {details.statusNote && (
                <p><strong>עדכון מצב: </strong>{details.statusNote}</p>
            )}

            {details.creator?.userName && (
                <p><strong>יוצר משימה: </strong>{details.creator.userName}</p>
            )}

            {details.daysOpen !== undefined && (
                <p><strong>ימים מאז פתיחה: </strong>{details.daysOpen}</p>
            )}

            {details.dueDate && (
                <p><strong>יעד לביצוע: </strong>{formatDate(details.dueDate)}</p>
            )}

            {details.finalDeadline && (
                <p><strong>תאריך יעד סופי: </strong>{formatDate(details.finalDeadline)}</p>
            )}

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
    );
};

export default TaskDetails;