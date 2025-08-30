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
import { updateTaskStatus } from '../../services/updateService.js';
import { getTaskHistory } from '../../services/historyService.js';
import EditTask from '../../components/editTask/EditTask.jsx';
import { useNavigate } from 'react-router-dom';
import TaskAgGrid from '../../components/taskAgGrid/taskAgGrid.jsx';
import TaskDetails from '../../components/taskDetails/TaskDetails.jsx';

ModuleRegistry.registerModules([AllCommunityModule]);

// ✨ פונקציה לחיפוש חכם
const enrichTasksWithSearchText = (tasks) => {
    return tasks.map(task => {
        const searchParts = [
            task.taskId,
            task.title,
            task.details,
            task.project,
            task.status,
            task.statusNote,
            task.failureReason,
            task.importance,
            task.subImportance,
            task.creator?.userName,
            task.mainAssignee?.userName,
            ...(task.assignees?.map(a => a.userName) || []),
            task.organization?.name
        ];
        return {
            ...task,
            combinedSearchText: searchParts.filter(Boolean).join(' ').toLowerCase()
        };
    });
};
const statusOptions = [
    { status: "בתהליך", color: 'yellow' },
    { status: "בטיפול", color: 'purple' },
    { status: "הושלם", color: 'green' },
    { status: "מושהה", color: 'gray' },
    { status: "בוטלה", color: 'red' },
];



const Tasks = () => {
    const navigate = useNavigate();
    const suppressedChangeNodesRef = useRef(new Set());


    const { user } = useContext(AuthContext);

    const { filters, setFilters } = useContext(FilterContext);

    const [allTasks, setAllTasks] = useState([]);
    const [details, setDetails] = useState({});
    const [openDetails, setOpenDetails] = useState(false);
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [activeTab, setActiveTab] = useState('today');
    const [activeType, setActiveType] = useState(null);
    const [workersList, setWorkersList] = useState([]);
    const [organizationsList, setOrganizationsList] = useState([]);
    const [ShowEditModal, setShowEditModal] = useState(false)
    const [selectedTask, setSelectedTask] = useState({});


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
        }
    }, [user]);
    const [version, setVersion] = useState(0);

    const refreshTasks = () => setVersion(v => v + 1);
    useEffect(() => {
        fetchTasks(activeTab);
    }, [activeTab, version]);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        fetchTasks(activeTab);
    }, [activeTab, fetchTasks]);


    useEffect(() => {

        const fetchFiltersData = async () => {
            const token = user?.token;
            if (!token) return;
            try {
                const [usersRes, orgsRes] = await Promise.all([
                    getUserNames(token),
                    fetchAllAssociations(token)
                ]);

                setWorkersList(usersRes);
                setOrganizationsList(orgsRes);
            } catch (err) {
                alert(err.response?.data?.message || 'שגיאה בטעינת משתמשים/עמותות');
                console.error('שגיאה בטעינת משתמשים/עמותות:', err);
            }
        };

        fetchFiltersData();
    }, []);
    useEffect(() => {
        if (gridRef.current?.api && allTasks.length > 0) {
            setTimeout(() => {
                gridRef.current.api.onFilterChanged();
            }, 0);
        }
    }, [filters, allTasks]);

    const canCancelTask = (userObj, taskData) => {
        if (!userObj || !taskData) return false;
        // admin role
        if (userObj.role === 'מנהל') return true;

        const userId = userObj.id || userObj._id || userObj._id?.toString?.() || userObj.toString?.();

        // creator (taskData.creator may be id or object)
        if (taskData.creator && String(taskData.creator) === String(userId)) return true;
        if (taskData.creator && taskData.creator._id && String(taskData.creator._id) === String(userId)) return true;

        // mainAssignee (may be object or id)
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
            // await fetchTasks(activeTab);
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
        setShowEditModal(false)
    }

    const toHistory = async (taskId) => {
        try {
            navigate(`/history/${taskId}`, { target: '_blank' });
        }
        catch (error) {
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
            console.log("המשימה לעריכה:", task);
        }
        else {
            alert("אין לך הרשאה לערוך משימה זו!")
        }


    };

    const isExternalFilterPresent = () => {
        return Object.values(filters).some(val => val);
    };

    const doesExternalFilterPass = (node) => {
        console.log('בודק סינון עבור:', node.data);


        const data = node.data;
        const search = filters.keyword.toLowerCase();

        const matchesText = !filters.keyword || data.combinedSearchText?.includes(search);
        const matchesImportance = !filters.importance || data.importance === filters.importance;
        const matchesSubImportance = !filters.subImportance || data.subImportance === filters.subImportance;
        const effectiveStatus = data.personalDetails?.status || data.status;
        const matchesStatus = !filters.status || effectiveStatus === filters.status;
        const matchesOrganization =
            !filters.organization || data.organization?._id === filters.organization;


        const matchesDateFrom = !filters.dateFrom || new Date(data.dueDate) >= new Date(filters.dateFrom);
        const matchesDateTo = !filters.dateTo || new Date(data.dueDate) <= new Date(filters.dateTo);

        const matchesAssignee = !filters.selectedAssignee || (
            filters.assigneeType === 'main'
                ? data.mainAssignee?._id === filters.selectedAssignee
                : data.assignees?.some(a => a._id === filters.selectedAssignee)
        );


        return (
            matchesText &&
            matchesImportance &&
            matchesSubImportance &&
            matchesStatus &&
            matchesOrganization &&
            matchesDateFrom &&
            matchesDateTo &&
            matchesAssignee
        );
    };

    const [columnDefs] = useState([
        {
            headerName: "", field: "duplicate", maxWidth: 50,
            cellRenderer: (params) => <div className='copy iconButton' title='שכפל'><Copy size={17} color="black" onClick={() => toDuplicateTask(params.data._id)} style={{ cursor: "pointer" }}/></div>
        },
        {
            headerName: "מס'", field: 'taskId', maxWidth: 100
            , cellStyle: () => {
                return {
                    color: 'rgb(15, 164, 157)',
                };
            }
        },
        {
            headerName: 'כותרת', field: 'title',
            cellStyle: () => {
                return {
                    color: 'rgb(29, 136, 163)',
                };
            }
        },
        {
            headerName: 'עמותה',
            valueGetter: (params) => params.data.organization?.name || '',
            cellStyle: () => {
                return {
                    color: 'rgb(29, 51, 163)',
                };
            }
        },
        {
            headerName: 'אחראי ראשי',
            valueGetter: (params) => params.data.mainAssignee?.userName || '',
            cellStyle: () => {
                return {
                    color: 'rgb(86, 54, 161)',
                };
            }

        },
        {
            headerName: 'סטטוס',
            field: 'status',
            editable: true,
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
            cellRenderer: (params) => <div className='history iconButton' title='צפה בהיסטוריה'><History size={17} color="black" onClick={() => toHistory(params.data._id)} style={{ cursor: "pointer" }}/></div>
        },
        {
            headerName: "", field: "delete", maxWidth: 50,
            cellRenderer: (params) => <div className='trash iconButton' title='מחק'><Trash size={17} color="black" onClick={() => toDelete(params.data._id)} style={{ cursor: "pointer" }}/> </div>
        },
        {
            headerName: "", field: "edit", maxWidth: 50,
            cellRenderer: (params) => <div className='pencil iconButton' title='ערוך'><Pencil size={17} color="black" onClick={() => toEdit(params.data)} style={{ cursor: "pointer" }}/></div>
        },
    ]);
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

            }
            catch (error) {
                console.log("!", error.response?.data?.message || error.message || 'שגיאה לא ידועה')
                alert(error.response?.data?.message || error.message || 'שגיאה לא ידועה');

                // החזרת הערך הישן אם קרתה שגיאה בשרת
                suppressedChangeNodesRef.current.add(params.node.id);
                params.node.setDataValue(params.colDef.field, oldStatus);
            }
        }
    };




    return (
        <div className="page-container">
            <div className="controls-container">
                <div className="search-input-container">
                    <Search size={16} className="search-icon" />

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
                <div className="tabs-container">

                    <div className="main-tabs">

                        <button className="tab-button arrows" onClick={handlePreviousTab}>
                            <ChevronRight />
                        </button>


                        <button
                            className={`tab-button active`}
                            onClick={() => setActiveTab(tabs[activeIndex].key)}
                        >
                            {tabs[activeIndex].label}
                        </button>

                        <button className="tab-button arrows" onClick={handleNextTab}>
                            <ChevronLeft />
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


            </div>

            {showCreatePopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <button onClick={handleClosePopup} className="close-btn">X</button>
                        <CreateTask onClose={handleClosePopup} onTaskCreated={() => fetchTasks(activeTab)} />

                    </div>
                </div>
            )}
            {ShowEditModal && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <button onClick={handleClosePopupEdit} className="close-btn">X</button>
                        <EditTask
                            taskToEdit={selectedTask}
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
            <div className="filters-bar">
                <div className="filters-content">

                    <button onClick={() => setFilters({
                        keyword: '',
                        importance: '',
                        subImportance: '',
                        status: '',
                        assigneeType: '',
                        selectedAssignee: '',
                        organization: '',
                        dateFrom: '',
                        dateTo: ''
                    })}>
                        איפוס סינון
                    </button>

                    {/* חשיבות */}
                    <select
                        value={filters.importance || ''}
                        onChange={(e) => {
                            const importance = e.target.value || undefined;
                            setFilters(prev => ({
                                ...prev,
                                importance,
                                subImportance: importance === 'מיידי' ? prev.subImportance : undefined
                            }));
                        }}
                    >
                        <option value="">רמת חשיבות</option>
                        <option value="מיידי">מיידי</option>
                        <option value="מגירה">מגירה</option>
                        <option value="תאריך">תאריך</option>
                        <option value="כללי">כללי</option>
                        <option value="עקביות">עקביות</option>
                    </select>

                    {/* תת־חשיבות */}
                    {filters.importance === 'מיידי' && (
                        <select
                            value={filters.subImportance || ''}
                            onChange={(e) =>
                                setFilters(prev => ({ ...prev, subImportance: e.target.value || undefined }))
                            }
                        >
                            <option value="">תת דירוג</option>
                            <option value="דחוף">דחוף</option>
                            <option value="ממוספר">ממוספר</option>
                            <option value="בהקדם האפשרי">בהקדם האפשרי</option>
                            <option value="לפי תאריך">לפי תאריך</option>
                        </select>
                    )}

                    {/* סטטוס */}
                    <select
                        value={filters.status || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
                    >
                        <option value="">סטטוס</option>

                        {statusOptions.map((op, i) =>
                            <option key={i} value={op.status}
                                style={{
                                    backgroundColor: op.color,
                                }}>{op.status}</option>

                        )}
                    </select>

                    {/* סוג עובד */}
                    <select
                        value={filters.assigneeType || ''}
                        onChange={(e) => setFilters(prev => ({
                            ...prev,
                            assigneeType: e.target.value || undefined,
                            selectedAssignee: undefined // איפוס עובד שנבחר
                        }))}
                    >
                        <option value="">בחר סוג עובד</option>
                        <option value="main">ראשי</option>
                        <option value="secondary">משני</option>
                    </select>

                    {/* בחירת עובד מתוך רשימה */}
                    {filters.assigneeType && (
                        <select
                            value={filters.selectedAssignee || ''}
                            onChange={(e) =>
                                setFilters(prev => ({ ...prev, selectedAssignee: e.target.value || undefined }))
                            }
                        >
                            <option value="">בחר עובד</option>
                            {workersList.map(worker => (
                                <option key={worker._id} value={worker._id}>
                                    {worker.userName}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* עמותה */}
                    <select
                        value={filters.organization || ''}
                        onChange={(e) =>
                            setFilters(prev => ({ ...prev, organization: e.target.value || undefined }))
                        }
                    >
                        <option value="">בחר עמותה</option>
                        {organizationsList.map(org => (
                            <option key={org._id} value={org._id}>
                                {org.name}
                            </option>
                        ))}
                    </select>

                    {/* טווח תאריכים */}

                    <input
                        type="date"
                        value={filters.dateFrom || ''}
                        onChange={(e) =>
                            setFilters(prev => ({
                                ...prev,
                                dateFrom: e.target.value || '',
                                dateTo: '' // איפוס dateTo כשמשנים התחלה
                            }))
                        }
                    />

                    {filters.dateFrom && (
                        <input
                            type="date"
                            value={filters.dateTo || ''}
                            min={filters.dateFrom} // מונע בחירה של תאריך מוקדם
                            onChange={(e) =>
                                setFilters(prev => ({
                                    ...prev,
                                    dateTo: e.target.value || ''
                                }))
                            }
                        />
                    )}
                </div>
                <TrashWithRecycleIcon />

            </div>


            <TaskAgGrid
                rowData={allTasks}
                columnDefs={columnDefs}
                onCellValueChanged={onCellValueChanged}
                doesExternalFilterPass={doesExternalFilterPass}
                isExternalFilterPresent={isExternalFilterPresent}
            />
        </div>
    );
};

export default Tasks;
