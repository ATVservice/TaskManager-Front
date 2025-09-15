import './RecyclingBin.css';
import React, { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { fetchGetDeletedTasks, fetchRestoreTask } from '../../services/restoreService.js';
import { AuthContext } from '../../context/AuthContext.jsx';
import { History, Recycle } from 'lucide-react';
import { useContext } from 'react';
import TaskAgGrid from '../../components/taskAgGrid/taskAgGrid.jsx';
import { useNavigate } from 'react-router-dom';
import TaskDetails from '../../components/taskDetails/TaskDetails.jsx';
import { getMoreDetails } from '../../services/taskService.js';



const RecyclingBin = () => {
    const navigate = useNavigate();

    const { user } = useContext(AuthContext);

    const [data, setData] = useState([]);
    const [details, setDetails] = useState({});
    const [openDetails, setOpenDetails] = useState(false);
    const statusOptions = [
        { status: "לביצוע", color: 'yellow' },
        { status: "בטיפול", color: 'purple' },
        { status: "הושלם", color: 'green' },
        { status: "בוטלה", color: 'red' },
    ];


    const [columnDefs] = useState([
        {
            headerName: "", field: "restore", maxWidth: 50,
            cellRenderer: (params) => (
                <div className='recycle iconButton' title='צפה בהיסטוריה'>
                    <Recycle size={17} color="black" title="שחזר משימה"
                    onClick={() => toRestoreTask(params.data._id)} />
                </div>
            )
        },
        { headerName: "מס'", field: 'taskId', maxWidth: 100 },
        { headerName: 'כותרת', field: 'title' },
        {
            headerName: 'עמותה',
            valueGetter: (params) => params.data.organization?.name || ''
        },
        {
            headerName: 'אחראי ראשי',
            valueGetter: (params) => params.data.mainAssignee?.userName || ''
        },
        {
            headerName: 'סטטוס',
            field: 'status',
            cellRenderer: (params) => {
                const status = params.value;
                const option = statusOptions.find(opt => opt.status === status);
                const color = option?.color || 'gray';
                return (
                    <span style={{
                        backgroundColor: color,
                        width: '60px',
                        color: 'black',
                        padding: '2px 8px',
                        display: 'inline-block'
                    }}>
                        {status}
                    </span>
                );
            }
        },
        {
            headerName: 'פרטים', field: 'details', maxWidth: 100,
            cellRenderer: (params) => (
                <button className='details' onClick={() => MoreDetails(params.data._id)} title='פרטים נוספים' style={{ cursor: "pointer" }}>לפרטים</button>
            )
        },
        {
            headerName: "", field: "history", maxWidth: 50,
            cellRenderer: (params) => (
                <div className='history iconButton' title='צפה בהיסטוריה'>
                    <History size={17} color="black" onClick={() => toHistory(params.data)} />
                </div>
            )
        },

    ]);
    const closeDetailsDiv = () => {
        setOpenDetails(false);
        setDetails({});
    };
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
    const toHistory = async (task) => {
        console.log("tttt", task);
        let model;
        if (task.frequencyType) {
            model = "RecurringTask";
        }
        else if (task.taskModel) {
            model = "TodayTask";
        }
        else {
            model = "Task";
        }

        try {
            navigate(`/history/${task._id}/${model}`, { target: '_blank' });
        }
        catch (error) {
            alert("הבעיה פה");
            alert(error.response?.data?.message);
        }
    };

    const toRestoreTask = async (taskId) => {
        const token = user?.token;
        const { value: password, isConfirmed } = await Swal.fire({
            title: 'אימות סיסמה למחיקת משימה',
            input: 'password',
            inputLabel: 'הכנס/י סיסמה',
            inputPlaceholder: 'סיסמה נדרשת למחיקה',
            confirmButtonText: 'אשר',
            cancelButtonText: 'ביטול',
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return 'חייבים להזין סיסמה';
                }
            },
        });

        if (!isConfirmed) return;
        try {
            fetchRestoreTask(token, password, taskId)
            alert("שוחזר בהצלחה!")
            setData(prev => prev.filter(task => task._id !== taskId));


        } catch (err) {
            alert(err.response?.data?.message || 'שגיאה בשחזור משימה');
            console.error('שגיאה בשחזור משימה', err);
        }
    }



    useEffect(() => {
        if (!user?.token) return;
        const GetDeletedTasks = async () => {
            try {
                const deletedTasks = await fetchGetDeletedTasks(user.token);
                setData(deletedTasks);
                console.log("סל מחזור---", deletedTasks)

            } catch (err) {
                alert(err.response?.data?.message || 'שגיאה בטעינת המשימות המחוקות');
                console.error('שגיאה בטעינת משימות מחוקות', err);
            }
        };
        GetDeletedTasks();
    }, [user]);


    return (
        <div className='RecyclingBin-page-wrapper'>
            <div className="RecyclingBin-header">
                <Recycle className="title-icon-RecyclingBin" size={20} />
                <h2 className="RecyclingBin-title">סל המיחזור</h2>
            </div>
            <div className="RecyclingBin-grid-container">

                <TaskAgGrid
                    rowData={data}
                    columnDefs={columnDefs}

                />
                <TaskDetails
                    details={details}
                    isOpen={openDetails}
                    onClose={closeDetailsDiv}
                />
            </div>
        </div>
    );
};

export default RecyclingBin;
