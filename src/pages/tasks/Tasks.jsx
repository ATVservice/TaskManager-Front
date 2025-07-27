import React, { useEffect, useState } from 'react';
import { getMoreDetails, getTasks } from '../../services/taskService';
import { Copy, Pencil, Trash, History, Plus } from 'lucide-react';
import CreateTask from '../../components/createTask/CreateTask';
import {duplicateTask} from '../../services/taskService';
import './Tasks.css';

const Tasks = () => {
    const [allTasks, setAllTasks] = useState([]);
    const [details, setDetails] = useState({});
    const [openDetails, setOpenDetails] = useState(false);
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const handleClosePopup = () => {
        setShowCreatePopup(false);
      };
      const fetchTasks = async () => {
        try {
            const data = await getTasks();
            setAllTasks(data);
        } catch (error) {
            alert(error.response?.data?.message || 'שגיאה בשליפת המשימות');
            console.error('Error getting tasks:', error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const MoreDetails = async (_id) => {
        try {
            const detail = await getMoreDetails(_id);
            setDetails(detail);
            setOpenDetails(true);
        } catch (error) {
            alert(error.response?.data?.message);
            console.error('Error getting more details:', error);
        }
    };
    const toDuplicateTask = async(taskId) => {
        try {
           await duplicateTask(taskId);
           alert("משימה שוכפלה בהצלחה!")
           const updatedTasks = await getTasks();
           setAllTasks(updatedTasks);
            
        } catch (error) {
            alert(error.response?.data?.message);
        }
    }

    const closeDetailsDiv = () => {
        setOpenDetails(false);
        setDetails({});
    };

    return (
        <div className="page-container">

            {openDetails && (
                <div className="side-popup">
                    <button className="close-btn" onClick={closeDetailsDiv}>X</button>
                    <h3>פרטים נוספים</h3>
                    <p>אחראים:</p>
                    {details.assignees?.map((ass, i) => (
                        <p key={i}>{i + 1}.{ass.userName}</p>
                    ))}
                    <p> יוצר משימה:{details.creator.userName}</p>
                    <p>ימים מאז פתיחה:{details.daysOpen}</p>
                    <p>יעד לביצוע: {new Date(details.dueDate).toLocaleDateString('he-IL')}</p>
                    <p>תאריך יעד סופי: {new Date(details.finalDeadline).toLocaleDateString('he-IL')}</p>
                    {details.subImportance &&
                        <p>תת דירוג:{details.subImportance}</p>
                    }
                    {details.details &&
                        <p>פרטים:{details.details}</p>
                    }
                    {details.project &&
                        <p> פרויקט:{details.project}</p>
                    }

                </div>
            )
            }

            <div className="table-container">
                <button className='add-task-button' onClick={() => setShowCreatePopup(true)}> <Plus size={20} color="#fafafa" />  הוסף משימה  </button>

                {showCreatePopup && (
                    <div className="popup-overlay">
                        <div className="popup-content">
                            <button onClick={handleClosePopup} className="close-btn">X</button>
                            <CreateTask onClose={handleClosePopup} onTaskCreated={fetchTasks} />
                        </div>
                    </div>
                )}
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>מס' משימה</th>
                            <th>כותרת</th>
                            <th>עמותה</th>
                            <th>אחראי ראשי</th>
                            <th>סטטוס</th>
                            <th>רמת חשיבות</th>
                            <th>פרטים</th>
                            <th>היסטוריה</th>
                            <th>עריכה</th>
                            <th>מחיקה</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allTasks.map((det) => (
                            <tr key={det._id}>
                                <td><Copy size={20} color="#042486" onClick={() => toDuplicateTask(det.taskId)}/></td>
                                <td>{det.taskId}</td>
                                <td>{det.title}</td>
                                <td>{det.organization.name}</td>
                                <td>{det.mainAssignee.userName}</td>
                                <td>{det.status}</td>
                                <td>{det.importance}</td>
                                <td>
                                    <button onClick={() => MoreDetails(det._id)}>צפה בפרטים</button>
                                </td>
                                <td><History color="#042486" /></td>
                                <td><Pencil color="#042486" /></td>
                                <td><Trash color="#042486" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div >
    );
};

export default Tasks;
