import React, { useCallback, useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { getMoreDetails, getTasks } from '../../services/taskService';
import { fetchTodayTasks, fetchRecurringTasks, fetchCompleteds, fetchCancelled, fetchDrawer } from '../../services/filterTasksService.js';
import { Copy, Pencil, Trash, History, Plus } from 'lucide-react';
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

const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'];
const months = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

const Tasks = () => {
    const { user } = useContext(AuthContext);
    const { filters, setFilters } = useContext(FilterContext);

    const [allTasks, setAllTasks] = useState([]);
    const [details, setDetails] = useState({});
    const [openDetails, setOpenDetails] = useState(false);
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [activeTab, setActiveTab] = useState('today');
    const [workersList, setWorkersList] = useState([]);
    const [organizationsList, setOrganizationsList] = useState([]);

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

    // useEffect(() => {
    //     if (gridRef.current?.api && filters) {
    //         setTimeout(() => {
    //             gridRef.current.api.onFilterChanged();
    //         }, 0);
    //     }

    // }, [filters]);

    // useEffect(() => {
    //     if (gridRef.current?.api && allTasks.length > 0) {
    //         gridRef.current.api.onFilterChanged();
    //     }
    // }, [filters, allTasks]);




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

    const toHistory = (taskId) => {
        alert(`היסטוריית המשימה ${taskId} תתממשק בהמשך!`);
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
    

    const toEdit = (taskId) => {
        alert(`עריכת המשימה ${taskId} תתממשק בהמשך!`);
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
        const matchesStatus = !filters.status || data.status === filters.status;
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
            cellRenderer: (params) => <Copy size={20} color="#042486" onClick={() => toDuplicateTask(params.data._id)} />
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
            headerName: 'פרטים', field: 'details', maxWidth: 100,
            cellRenderer: (params) => (
                <button className='details' onClick={() => MoreDetails(params.data._id)}>לפרטים</button>
            )
        },
        {
            headerName: "", field: "history", maxWidth: 50,
            cellRenderer: (params) => <History size={20} color="#042486" onClick={() => toHistory(params.data._id)} />
        },
        {
            headerName: "", field: "delete", maxWidth: 50,
            cellRenderer: (params) => <Trash size={20} color="#042486" onClick={() => toDelete(params.data._id)} />
        },
        {
            headerName: "", field: "edit", maxWidth: 50,
            cellRenderer: (params) => <Pencil size={20} color="#042486" onClick={() => toEdit(params.data._id)} />
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
                <div className="tabs-container">
                    {[
                        { key: 'today', label: 'משימות להיום' },
                        { key: 'today-single', label: 'שוטפות' },
                        { key: 'today-recurring', label: 'קבועות' },
                        { key: 'future', label: 'משימות עתידיות' },
                        { key: 'recurring', label: 'קבועות' },
                        { key: 'completed', label: 'בוצעו' },
                        { key: 'cancelled', label: 'בוטלו' },
                        { key: 'drawer', label: 'מגירה' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
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
                    {details.daysOpen && <p>ימים מאז פתיחה: {details.daysOpen}</p>}
                    {details.dueDate && <p>יעד לביצוע: {new Date(details.dueDate).toLocaleDateString('he-IL')}</p>}
                    {details.finalDeadline && <p>תאריך יעד סופי: {new Date(details.finalDeadline).toLocaleDateString('he-IL')}</p>}
                    {details.details && <p>פרטים: {details.details}</p>}
                    {details.project && <p>פרויקט: {details.project}</p>}
                    {details.frequencyType && <p>סוג תדירות: {details.frequencyType}</p>}
                    {/* {details.frequencyDetails && <p>פרטי תדירות:</p>} */}
                    {details.frequencyType === 'יומי' && details.frequencyDetails.includingFriday === true && <p>'ימים א'-ו</p>}
                    {details.frequencyType === 'יומי' && details.frequencyDetails.includingFriday === false && <p>'ימים א'-ה</p>}
                    {details.frequencyType === 'יומי פרטני' &&
                        <p>ימים:</p> &&
                        details.frequencyDetails.days.map((i, index) => (
                            <p key={index}>{daysOfWeek[i]}</p>
                        ))}
                    {details.frequencyType === 'חודשי' && <p> יום בחודש: {details.frequencyDetails.dayOfMonth}</p>}
                    {details.frequencyType === 'שנתי' && (
                        <>
                            <p>יום: {details.frequencyDetails.day}</p>
                            <p>חודש: {months[details.frequencyDetails.month - 1]}</p>
                        </>
                    )}

                </div>
            )}
            <div className="filters-bar">
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
                    <option value="בתהליך">בתהליך</option>
                    <option value="הושלם">הושלם</option>
                    <option value="מושהה">מושהה</option>
                    <option value="בטיפול">בטיפול</option>
                    <option value="בוטלה">בוטלה</option>
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
            

            <div className="ag-theme-alpine">
                <AgGridReact
                    ref={gridRef}
                    rowData={allTasks}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    pagination={true}
                    enableRtl={true}
                    paginationPageSize={20}
                    domLayout="autoHeight"
                    animateRows={true}
                    isExternalFilterPresent={isExternalFilterPresent}
                    doesExternalFilterPass={doesExternalFilterPass}

                />
            </div>
        </div>
    );
};

export default Tasks;
