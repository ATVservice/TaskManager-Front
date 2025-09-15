import React, { useCallback, useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { getMoreDetails, getTasks } from '../../services/taskService';
import { fetchTodayTasks, fetchRecurringTasks, fetchCompleteds, fetchCancelled, fetchDrawer } from '../../services/filterTasksService.js';
import { Copy, Pencil, Trash, History, Plus, Search, ChevronRight, ChevronLeft } from 'lucide-react';
import CreateTask from '../../components/createTask/CreateTask';
import { FilterContext } from '../../context/FilterContext';
import { duplicateTask } from '../../services/taskService';
import './Tasks.css';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { getUserNames } from '../../services/userService';
import { fetchAllAssociations } from '../../services/associationService';
import { fetchDeleteTask } from '../../services/deleteTaskService.js';
import TrashWithRecycleIcon from '../../components/trashWithRecycleIcon/TrashWithRecycleIcon.jsx';
import { updateRecurringStatus, updateTaskStatus } from '../../services/updateService.js';
import { getTaskHistory } from '../../services/historyService.js';
import EditTask from '../../components/editTask/EditTask.jsx';
import { useNavigate } from 'react-router-dom';
import TaskAgGrid from '../../components/taskAgGrid/taskAgGrid.jsx';
import TaskDetails from '../../components/taskDetails/TaskDetails.jsx';
import { fetchAddProject } from '../../services/projectService.js';

ModuleRegistry.registerModules([AllCommunityModule]);

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('he-IL');
};
// ✨ פונקציה לחיפוש חכם
const enrichTasksWithSearchText = (tasks) => {
    return tasks.map(task => {
        const frequencyParts = [];
        if (task.frequencyType) {
            frequencyParts.push(task.frequencyType);
            if (task.frequencyDetails) {
                switch (task.frequencyType) {
                    case 'יומי':
                        frequencyParts.push(task.frequencyDetails?.includingFriday ? "'א'-ו" : "'א'-ה");
                        break;
                    case 'יומי פרטני':
                        if (task.frequencyDetails.days?.length) {
                            const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'];
                            frequencyParts.push(...task.frequencyDetails.days.map(d => daysOfWeek[d]));
                        }
                        break;
                    case 'חודשי':
                        if (task.frequencyDetails.dayOfMonth)
                            frequencyParts.push(`יום בחודש ${task.frequencyDetails.dayOfMonth}`);
                        break;
                        case 'שנתי':
                            const months = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
                                            'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
                            if (task.frequencyDetails.day)
                                frequencyParts.push(`יום ${task.frequencyDetails.day}`);
                            if (task.frequencyDetails.month)
                                frequencyParts.push(`חודש ${months[task.frequencyDetails.month - 1]}`);
                            break;
                        
                    default:
                        break;
                }
            }
        }
        const searchParts = [
            task.taskId,
            task.title,
            task.details,
            task.project?.name,
            task.status,
            task.statusNote,
            task.daysOpen,
            task.failureReason,
            task.importance,
            task.subImportance,
            task.dueDate,
            task.cancelReason,
            task.failureReason?.option,
            task.failureReason?.customText,
            formatDate(task.dueDate),
            formatDate(task.finalDeadline),
            task.creator?.userName,
            task.frequencyType,
            task.mainAssignee?.userName,
            ...(task.assignees?.map(a => a.userName) || []),
            task.organization?.name,
            ...frequencyParts,
        ];
        return {
            ...task,
            combinedSearchText: searchParts.filter(Boolean).join(' ').toLowerCase()
        };
    });
};

const statusOptions = [
    { status: "לביצוע", color: 'yellow' },
    { status: "בטיפול", color: 'purple' },
    { status: "הושלם", color: 'green' },
    { status: "בוטלה", color: 'red' },
];

const Tasks = () => {
    const navigate = useNavigate();
    const suppressedChangeNodesRef = useRef(new Set());
    const { user } = useContext(AuthContext);

    const [allTasks, setAllTasks] = useState([]);
    const [details, setDetails] = useState({});
    const [openDetails, setOpenDetails] = useState(false);
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [activeTab, setActiveTab] = useState('today-recurring');
    const [activeType, setActiveType] = useState('today-recurring');
    const [ShowEditModal, setShowEditModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [taskType, setTaskType] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const tabs = [
        { key: 'today', label: 'משימות להיום' },
        { key: 'future', label: 'משימות עתידיות' },
        { key: 'recurring', label: 'קבועות' },
        { key: 'completed', label: 'בוצעו' },
        { key: 'cancelled', label: 'בוטלו' },
        { key: 'drawer', label: 'מגירה' },
    ];

    const [activeIndex, setActiveIndex] = useState(0);

    const handleNextTab = () => {
        setActiveIndex((prev) => {
            const newIndex = (prev + 1) % tabs.length;
            setActiveTab(tabs[newIndex].key);
            return newIndex;
        });
    };

    const handlePreviousTab = () => {
        setActiveIndex((prev) => {
            const newIndex = (prev - 1 + tabs.length) % tabs.length;
            setActiveTab(tabs[newIndex].key);
            return newIndex;
        });
    };

    const gridRef = useRef();

    const fetchTasks = useCallback(async (tab) => {
        setIsLoading(true);
        const token = user?.token;
        try {
            let data = [];
            switch (tab) {
                case 'today':
                    data = await fetchTodayTasks();
                    break;
                case 'today-single':
                    data = await fetchTodayTasks(false);
                    break;
                case 'today-recurring':
                    data = await fetchTodayTasks(true);
                    break;
                case 'future':
                    data = await getTasks(token);
                    break;
                case 'recurring':
                    data = await fetchRecurringTasks(token);
                    break;
                case 'completed':
                    data = await fetchCompleteds(token);
                    break;
                case 'cancelled':
                    data = await fetchCancelled(token);
                    break;
                case 'drawer':
                    data = await fetchDrawer(token);
                    break;
                default:
                    data = [];
            }

            const enriched = enrichTasksWithSearchText(data);
            setAllTasks(enriched);
        } catch (error) {
            alert(error.response?.data?.message || 'שגיאה בשליפת המשימות');
            console.error('Error getting tasks:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    const filteredTasks = allTasks.filter(task =>
        task.combinedSearchText.includes(debouncedSearchTerm.toLowerCase())
    );

    const [version, setVersion] = useState(0);

    const refreshTasks = () => setVersion(v => v + 1);

    useEffect(() => {
        if (activeTab === "today") {
            setActiveTab("today-recurring");
            setActiveType("today-recurring");
            return;
        }
        fetchTasks(activeTab);
    }, [activeTab, version]);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        fetchTasks(activeTab);
    }, [activeTab, fetchTasks]);

    const canCancelTask = (userObj, taskData) => {
        if (!userObj || !taskData) return false;
        if (userObj.role === 'מנהל') return true;

        const userId = userObj.id || userObj._id || userObj._id?.toString?.() || userObj.toString?.();

        if (taskData.creator && String(taskData.creator) === String(userId)) return true;
        if (taskData.creator && taskData.creator._id && String(taskData.creator._id) === String(userId)) return true;

        if (taskData.mainAssignee) {
            if (taskData.mainAssignee._id && String(taskData.mainAssignee._id) === String(userId)) return true;
            if (String(taskData.mainAssignee) === String(userId)) return true;
        }

        return false;
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

    const toDuplicateTask = async (taskId) => {
        const token = user?.token;
        try {
            await duplicateTask(taskId, token);
            alert("משימה שוכפלה בהצלחה!");
            refreshTasks();
        } catch (error) {
            alert(error.response?.data?.message);
        }
    };

    const closeDetailsDiv = () => {
        setOpenDetails(false);
        setDetails({});
    };

    const handleClosePopup = () => {
        setShowCreatePopup(false);
    };

    const handleClosePopupEdit = () => {
        setShowEditModal(false);
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

    const toDelete = async (taskId) => {
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
            await fetchDeleteTask(token, password, taskId);
            alert("המשימה נמחקה בהצלחה");
            refreshTasks();
        } catch (error) {
            alert(error.response?.data?.message || 'שגיאה במחיקה');
        }
    };

    const toEdit = (task) => {
        const canEditTask = user.id === task.creator ||
            user.id === task.mainAssignee._id ||
            user.role === 'מנהל';

        if (canEditTask) {
            setShowEditModal(true);
            setSelectedTask(task);

            if (task.frequencyType || task.isRecurringInstance) {
                setTaskType("recurring");
            }
            else {
                setTaskType("single");
            }
            console.log("המשימה לעריכה:", task);
        }
        else {
            alert("אין לך הרשאה לערוך משימה זו!");
        }
    };

    // פונקציה מתוקנת להגדרת עמודות - סדר: מס, כותרת, אחראי ראשי, עמותה, סטטוס, פרטים, שכפול, הסטוריה, מחיקה, עדכון
    const getColumnDefs = () => {
        const baseColumns = [
            // 1. מספר משימה
            {
                headerName: "מס'",
                field: 'taskId',
                maxWidth: 100,
                flex: 0, // עמודה קבועה
                cellStyle: () => ({
                    color: 'rgb(15, 164, 157)',
                    fontWeight: '600'
                })
            },
            // 2. כותרת - תקבל יותר מקום
            {
                headerName: 'כותרת',
                field: 'title',
                flex: 2, // תקבל פי 2 יותר מקום מעמודות רגילות
                cellStyle: () => ({
                    color: 'rgb(29, 136, 163)',
                    fontWeight: '500'
                })
            },
            // 3. אחראי ראשי
            {
                headerName: 'אחראי ראשי',
                valueGetter: (params) => params.data.mainAssignee?.userName || '',
                flex: 1,
                cellStyle: () => ({
                    color: 'rgb(86, 54, 161)',
                    fontWeight: '500'
                })
            },
            // 4. עמותה
            {
                headerName: 'עמותה',
                valueGetter: (params) => params.data.organization?.name || '',
                flex: 1,
                cellStyle: () => ({
                    color: 'rgb(29, 51, 163)',
                    fontWeight: '500'
                })
            }
        ];
    
        // 5. הוספת עמודת סטטוס (רק אם לא recurring)
        if (activeTab !== 'recurring') {
            baseColumns.push({
                headerName: 'סטטוס',
                field: 'status',
                flex: 1,
                maxWidth: 120,
                editable: () => activeTab !== 'recurring',
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: {
                    values: statusOptions.map(x => x.status)
                },
                valueGetter: (params) => params.data.personalDetails?.status || params.data.status,
                valueSetter: (params) => {
                    if (params.newValue !== params.oldValue) {
                        if (params.data.personalDetails) {
                            params.data.personalDetails.status = params.newValue;
                        } else {
                            params.data.status = params.newValue;
                        }
                        return true;
                    }
                    return false;
                },
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
                            display: 'inline-block',
                            borderRadius: '4px',
                            textAlign: 'center',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}>
                            {status}
                        </span>
                    );
                }
            });
        }
    
        // 6. פרטים
        baseColumns.push({
            headerName: 'פרטים',
            field: 'details',
            width: 100,
            flex: 0,
            cellRenderer: (params) => (
                <button className='details' onClick={() => MoreDetails(params.data._id)} title='פרטים נוספים' style={{ cursor: "pointer" }}>
                    לפרטים
                </button>
            )
        });
    
        // 7. שכפול
        baseColumns.push({
            headerName: "", 
            field: "duplicate", 
            width: 50,
            flex: 0,
            minWidth: 50,
            maxWidth: 50,
            suppressSizeToFit: true,
            sortable: false,
            filter: false,
            resizable: false,
            cellRenderer: (params) => (
                <div className='copy iconButton' title='שכפל משימה'>
                    <Copy size={17} color="black" onClick={() => toDuplicateTask(params.data._id)} />
                </div>
            )
        });

        // 8. היסטוריה
        baseColumns.push({
            headerName: "",
            field: "history",
            width: 50,
            flex: 0,
            minWidth: 50,
            maxWidth: 50,
            suppressSizeToFit: true,
            sortable: false,
            filter: false,
            resizable: false,
            cellRenderer: (params) => (
                <div className='history iconButton' title='צפה בהיסטוריה'>
                    <History size={17} color="black" onClick={() => toHistory(params.data)} />
                </div>
            )
        });

        // 9. מחיקה
        baseColumns.push({
            headerName: "",
            field: "delete",
            width: 50,
            flex: 0,
            minWidth: 50,
            maxWidth: 50,
            suppressSizeToFit: true,
            sortable: false,
            filter: false,
            resizable: false,
            cellRenderer: (params) => (
                <div className='trash iconButton' title='מחק משימה'>
                    <Trash size={17} color="black" onClick={() => toDelete(params.data._id)} />
                </div>
            )
        });

        // 10. עדכון (רק אם לא today tabs)
        if (activeTab !== 'today' && activeTab !== 'today-single' && activeTab !== 'today-recurring') {
            baseColumns.push({
                headerName: "", 
                field: "edit", 
                width: 50,
                flex: 0,
                minWidth: 50,
                maxWidth: 50,
                suppressSizeToFit: true,
                sortable: false,
                filter: false,
                resizable: false,
                cellRenderer: (params) => (
                    <div className='pencil iconButton' title='ערוך משימה'>
                        <Pencil size={17} color="black" onClick={() => toEdit(params.data)} />
                    </div>
                )
            });
        }

        return baseColumns;
    };

    const onCellValueChanged = async (params) => {
        if (suppressedChangeNodesRef.current.has(params.node.id)) {
            suppressedChangeNodesRef.current.delete(params.node.id);
            return;
        }
        const token = user?.token;

        if (params.colDef.field === 'status') {
            const taskId = params.data._id;
            const newStatus = params.newValue;
            const oldStatus = params.oldValue;

            if (activeTab === 'today-recurring') {
                try {
                    const { value: content, isConfirmed } = await Swal.fire({
                        title: 'הוספת הערה יומית',
                        input: 'text',
                        inputLabel: 'מה קרה במשימה?',
                        showCancelButton: true,
                        confirmButtonText: 'הוסף',
                        cancelButtonText: 'בטל',
                    });

                    if (isConfirmed) {
                        await updateRecurringStatus(params.data.sourceTaskId, newStatus, token, content);
                        params.node.setDataValue(params.colDef.field, newStatus);
                        alert("עודכן בהצלחה");
                    } else {
                        suppressedChangeNodesRef.current.add(params.node.id);
                        params.node.setDataValue(params.colDef.field, oldStatus);
                    }
                } catch (error) {
                    alert(error.response?.data?.message || 'שגיאה בעדכון משימה קבועה');
                    suppressedChangeNodesRef.current.add(params.node.id);
                    params.node.setDataValue(params.colDef.field, oldStatus);
                }
                return;
            }

            if (newStatus === 'בוטלה') {
                const allowed = canCancelTask(user, params.data);
                if (!allowed) {
                    suppressedChangeNodesRef.current.add(params.node.id);
                    params.node.setDataValue(params.colDef.field, oldStatus);
                    alert('רק האחראי הראשי, מקים המשימה או המנהל יכולים לבטל משימה.');
                    return;
                }
            }

            try {
                const { value: statusNote, isConfirmed } = await Swal.fire({
                    title: 'האם להוסיף הערה לסטטוס?',
                    input: 'text',
                    inputLabel: 'הערה לסטטוס (לא חובה)',
                    showCancelButton: true,
                    confirmButtonText: 'עדכן ',
                    cancelButtonText: 'בטל',
                });

                if (isConfirmed) {
                    await updateTaskStatus(taskId, newStatus, token, statusNote);
                } else {
                    await updateTaskStatus(taskId, newStatus, token);
                }

                alert("עודכן בהצלחה");

            } catch (error) {
                console.log("!", error.response?.data?.message || error.message || 'שגיאה לא ידועה');
                alert(error.response?.data?.message || error.message || 'שגיאה לא ידועה');
                suppressedChangeNodesRef.current.add(params.node.id);
                params.node.setDataValue(params.colDef.field, oldStatus);
            }
        }
    };

    const createProject = async () => {
        const token = user?.token;

        const { value: formValues, isConfirmed } = await Swal.fire({
            title: "הוספת פרויקט",
            html: `
                <input id="swal-input1" class="swal2-input" placeholder="הכנס/י שם פרויקט">
                <label style="display:flex; align-items:center; justify-content:flex-start; margin-top:10px;">
                    <input type="checkbox" id="swal-input2" checked style="margin-right:8px;">
                    פעיל
                </label>
            `,
            focusConfirm: false,
            showCancelButton: true,
            preConfirm: () => {
                const name = document.getElementById('swal-input1').value;
                const isActive = document.getElementById('swal-input2').checked;
                if (!name) {
                    Swal.showValidationMessage('חובה להזין שם פרויקט');
                }
                return { name, isActive };
            },
            confirmButtonText: 'אשר',
            cancelButtonText: 'ביטול'
        });

        if (!isConfirmed) return;

        try {
            await fetchAddProject(formValues.name, formValues.isActive, token);
            await alert("נוסף בהצלחה!");
        } catch (err) {
            alert(err.response?.data?.message || 'שגיאה בהוספת פרויקט');
            console.error('שגיאה בהוספת פרויקט', err);
        }
    };

    return (
        <div className="page-container">
            <div className="controls-container">
                <div className='searchRecycleIcon'>
                    <div className="search-input-container">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="חיפוש"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <TrashWithRecycleIcon />
                </div>

                <div className="tabs-container">
                    <div className="main-tabs">
                        <button className="tab-button arrows" onClick={handlePreviousTab}>
                            <ChevronRight size={16} />
                            הקודם
                        </button>

                        <button className={`tab-button active`} onClick={() => setActiveTab(tabs[activeIndex].key)}>
                            {tabs[activeIndex].label}
                        </button>

                        <button className="tab-button arrows ChevronLeft" onClick={handleNextTab}>
                            הבא
                            <ChevronLeft size={16} />
                        </button>
                    </div>

                    {activeTab.startsWith('today') && (
                        <div className="sub-tabs">
                            <button
                                className={`filter-btn ${activeType === "today-single" ? "active" : ""}`}
                                onClick={() => { setActiveType('today-single'); setActiveTab('today-single'); }}
                            >
                                שוטפות
                            </button>
                            <button
                                className={`filter-btn ${activeType === "today-recurring" ? "active" : ""}`}
                                onClick={() => { setActiveType('today-recurring'); setActiveTab('today-recurring'); }}
                            >
                                קבועות
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-add add-task-button" onClick={() => setShowCreatePopup(true)}>
                        <Plus size={20} color="#fafafa" /> הוסף משימה
                    </button>
                    <button className="btn-add add-project-button" onClick={() => createProject(true)}>
                        <Plus size={20} color="#fafafa" /> הוסף פרויקט
                    </button>
                </div>
            </div>

            {showCreatePopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <button onClick={handleClosePopup} className="close-btn">×</button>
                        <CreateTask onClose={handleClosePopup} onTaskCreated={() => fetchTasks(activeTab)} />
                    </div>
                </div>
            )}

            {ShowEditModal && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <button onClick={handleClosePopupEdit} className="close-btn">×</button>
                        <EditTask
                            taskToEdit={selectedTask}
                            taskType={taskType}
                            onClose={() => setShowEditModal(false)}
                            onTaskUpdated={refreshTasks}
                        />
                    </div>
                </div>
            )}

            <TaskDetails
                details={details}
                isOpen={openDetails}
                onClose={closeDetailsDiv}
            />

            <TaskAgGrid
                rowData={filteredTasks}
                columnDefs={getColumnDefs()}
                onCellValueChanged={onCellValueChanged}
            />
        </div>
    );
};

export default Tasks;