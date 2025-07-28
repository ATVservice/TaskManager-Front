import React, { useEffect, useState } from 'react';
import { getMoreDetails, getTasks } from '../../services/taskService';
import { Copy, Pencil, Trash, History, Plus, Search } from 'lucide-react';
import CreateTask from '../../components/createTask/CreateTask';
import { duplicateTask } from '../../services/taskService';
import './Tasks.css';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);


const Tasks = () => {

    const [filters, setFilters] = useState({ keyword: '' });
    const [allTasks, setAllTasks] = useState([]);
    const [details, setDetails] = useState({});
    const [openDetails, setOpenDetails] = useState(false);
    const [showCreatePopup, setShowCreatePopup] = useState(false);

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
    const toDuplicateTask = async (taskId) => {
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

    const handleClosePopup = () => {
        setShowCreatePopup(false);
    };
    const toHistory = (taskId) => {
        alert(`היסטוריית המשימה ${taskId} תתממשק בהמשך!`)
    }
    const toDelete = (taskId) => {
        alert(` מחיקת משימה ${taskId} תתממשק בהמשך!`)
    }
    const toEdit = (taskId) => {
        alert(`עריכת המשימה ${taskId} תתממשק בהמשך!`)
    }

    const [columnDefs] = useState([
        {
            headerName: "", field: "duplicate", maxWidth: 50,
            cellRenderer: (params) => <Copy size={20} color="#042486" onClick={() => toDuplicateTask(params.data.taskId)} />
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
        { headerName: 'סטטוס', field: 'status' },
        {
            headerName: 'פרטים', field: 'details', cellRenderer: (params) => (
                <button onClick={() => MoreDetails(params.data._id)}>צפה בפרטים</button>
            )
        },
        {
            headerName: "", field: "history", maxWidth: 50,
            cellRenderer: (params) => <History size={20} color="#042486" onClick={() => toHistory(params.data.taskId)} />
        },
        {
            headerName: "", field: "edit", maxWidth: 50,
            cellRenderer: (params) => <Trash size={20} color="#042486" onClick={() => toEdit(params.data.taskId)} />
        },
        {
            headerName: "", field: "delete", maxWidth: 50,
            cellRenderer: (params) => <Pencil size={20} color="#042486" onClick={() => toDelete(params.data.taskId)} />
        },
    ]);

    const defaultColDef = {
        sortable: true,
        filter: true,
        resizable: true
    };

    return (
        <div className="page-container">
            <div className="controls-container">
                <div> <Search /></div>
                <div>
                <input
                    type="text"
                    placeholder="חיפוש"
                    value={filters.keyword}
                    onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                    className="search-input"
                />
                </div>

                <button className="add-task-button" onClick={() => setShowCreatePopup(true)}>
                    <Plus size={20} color="#fafafa" /> הוסף משימה
                </button>
            </div>

            {/* הפופאפ */}
            {showCreatePopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <button onClick={handleClosePopup} className="close-btn">X</button>
                        <CreateTask onClose={handleClosePopup} onTaskCreated={fetchTasks} />
                    </div>
                </div>
            )}

            {/* פרטים נוספים */}
            {openDetails && (
                <div className={`side-popup ${!openDetails ? 'hidden' : ''}`}>
                    <button className="close-btn" onClick={closeDetailsDiv}>X</button>
                    <h3>פרטים נוספים</h3>
                    <p>אחראים:</p>
                    {details.assignees?.map((ass, i) => (
                        <p key={i}>{i + 1}. {ass.userName}</p>
                    ))}
                    <p>חשיבות: {details.importance}</p>
                    {details.subImportance && <p>תת דירוג: {details.subImportance}</p>}
                    <p>יוצר משימה: {details.creator?.userName}</p>
                    <p>ימים מאז פתיחה: {details.daysOpen}</p>
                    <p>יעד לביצוע: {new Date(details.dueDate).toLocaleDateString('he-IL')}</p>
                    <p>תאריך יעד סופי: {new Date(details.finalDeadline).toLocaleDateString('he-IL')}</p>
                    {details.details && <p>פרטים: {details.details}</p>}
                    {details.project && <p>פרויקט: {details.project}</p>}
                </div>
            )}


            {/* הטבלה */}
            <div className="ag-theme-alpine">
                <AgGridReact

                    rowData={allTasks}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    pagination={true}
                    enableRtl={true}
                    paginationPageSize={20}
                    domLayout="autoHeight"
                    animateRows={true}
                    quickFilterText={filters.keyword}
                />
            </div>
        </div>
    );
}


export default Tasks;
