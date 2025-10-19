import './OverdueTasks.css';
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import TaskAgGrid from '../../components/taskAgGrid/taskAgGrid.jsx';
import TaskDetails from '../../components/taskDetails/TaskDetails.jsx';
import { getMoreDetails } from '../../services/taskService.js';
import toast from 'react-hot-toast';
import { Title } from 'react-head';
import { fetchUpdatedueDate, fetchUpdateStatusDelayed, getOverdueTasks } from '../../services/overdueTasksService.js';
import Swal from 'sweetalert2';
import { addComment } from '../../services/commentService.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);


const OverdueTasks = ({ tasks }) => {
    const { user } = useContext(AuthContext);

    const [data, setData] = useState(tasks || []); // ✅ התחלה מהפרופס
    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState({});
    const [openDetails, setOpenDetails] = useState(false);
    const [error, setError] = useState(null);

    const statusOptions = [
        { status: "הושלם", color: 'green' },
        { status: "בוטלה", color: 'red' },
        { status: "בטיפול", color: 'purple' },
        { status: "לביצוע", color: 'yellow' },
    ];


    const loadTasks = async () => {
        if (!user?.token) return;
        try {
            setLoading(true);
            const res = await getOverdueTasks(user.token);
            setData(res.tasks || []);
        } catch (err) {
            toast.error(err.response?.data?.message || 'שגיאה בטעינת המשימות');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    const [columnDefs] = useState([
        { headerName: "מס'", field: 'taskNumber', maxWidth: 100 },
        { headerName: 'כותרת', field: 'title' },
        { headerName: 'עמותה', valueGetter: (params) => params.data.organization?.name || '' },
        { headerName: 'אחראי ראשי', valueGetter: (params) => params.data.mainAssignee?.name || params.data.mainAssignee?.userName || '' },
        {
            headerName: 'סטטוס',
            field: 'userStatus',
            flex: 1,
            maxWidth: 120,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: () => ({ values: ['הושלם', 'בוטלה'] }),
            valueGetter: (params) => params.data.userStatus,
            valueSetter: async (params) => {
                if (params.newValue !== params.oldValue) {
                    const updated = await handleStatusChange(
                        params.data.taskId,
                        params.data.taskModel,
                        params.oldValue,
                        params.newValue
                    );
                    params.data.userStatus = updated;
                    return true;
                }
                return false;
            },
            cellRenderer: (params) => {
                const status = params.value;
                const option = statusOptions.find(opt => opt.status === status);
                const color = option?.color || 'gray';
                return (
                    <span className="status-badge" style={{
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
        },
        {
            headerName: 'תאריך דחייה',
            field: 'dueDate',
            flex: 1,
            minWidth: 160,
            cellRenderer: (params) => (
                <input
                type="date"
                min={dayjs().tz('Asia/Jerusalem').format('YYYY-MM-DD')}
                value={params.data.dueDate?.split('T')[0] || ''}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                    const selectedDate = e.target.value;
                    if (!selectedDate) return;
                    if (dayjs(selectedDate).isBefore(dayjs().tz('Asia/Jerusalem'), 'day')) {
                        toast.error('לא ניתן לבחור תאריך קודם להיום');
                        return;
                    }
                    handleDueDateChange(params, selectedDate);
                }}
                className="due-date-input"
              />
              
            )
        }
        
    ]);

    const closeDetailsDiv = () => {
        setOpenDetails(false);
        setDetails({});
    };

    const MoreDetails = async (taskId) => {
        const token = user?.token;
        try {
            const detail = await getMoreDetails(taskId, token);
            setDetails(detail);
            setOpenDetails(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'שגיאה, אנא נסה מאוחר יותר', { duration: 3000 });
        }
    };
    const handleDueDateChange = async (params, selectedDate) => {
        try {
            const { taskId, taskModel } = params.data;
            const token = user?.token;
    
            const confirmResult = await Swal.fire({
                title: 'לאשר שינוי תאריך?',
                text: `התאריך החדש יהיה ${selectedDate}`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'אשר',
                cancelButtonText: 'בטל',
                customClass: {
                    container: 'swal-container'
                }
            });
    
            if (!confirmResult.isConfirmed) return;
    
            // נעדכן גם dueDate וגם finalDeadline
            await fetchUpdatedueDate(token, selectedDate, selectedDate, taskModel, taskId);
            toast.success('תאריך יעד ותאריך סופי עודכנו בהצלחה ');
            await loadTasks();
    
        } catch (err) {
            toast.error(err.response?.data?.message || 'שגיאה בעדכון תאריך');
        }
    };
    

    const handleStatusChange = async (taskId, model, oldStatus, newStatus) => {

        try {
            if (!user?.token) throw new Error("אין גישה, המשתמש לא מחובר");

            const confirmResult = await Swal.fire({
                title: 'בטוח שברצונך לשנות את הסטטוס?',
                text: `סטטוס ישתנה מ-${oldStatus} ל-${newStatus}`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'כן',
                cancelButtonText: 'לא',
                customClass: {
                    container: 'swal-container'
                }
            });

            if (!confirmResult.isConfirmed) return oldStatus;

            const { value: note } = await Swal.fire({
                title: 'האם להוסיף הערה?',
                input: 'text',
                inputPlaceholder: 'תוכן ההערה (לא חובה)',
                showCancelButton: true,
                confirmButtonText: 'הוסף',
                cancelButtonText: 'דלג',
                customClass: {
                    container: 'swal-container'
                }
            });

            await fetchUpdateStatusDelayed(user.token, newStatus, model, taskId);
            if (note) {
                await addComment(taskId, model, note, user?.token);

            }

            toast.success(note ? 'סטטוס עודכן והערה נוספה' : 'סטטוס עודכן בהצלחה');

            await loadTasks();
            return newStatus;
        } catch (err) {
            toast.error(err.response?.data?.message || 'שגיאה בעדכון סטטוס');
            return oldStatus;
        }
    };

    return (
        <>
            <Title>משימות מתעכבות</Title>

            <div style={{ padding: '20px' }}>
                <h3 className="hh3">משימות מתעכבות</h3>
                <h4 className="hh4">עלייך להשלים או לדחות תאריך לכל המשימות!</h4>


                {error && <p style={{ color: 'red' }}>❌ שגיאה: {error}</p>}

                {!error && (
                    <div className='overdue-grid'>

                        <TaskAgGrid
                            rowData={data}
                            columnDefs={columnDefs}
                            onRowClicked={(params) => {
                                const target = params.event.target;
                                const tagName = target.tagName.toLowerCase();
                                if (["button", "svg", "path"].includes(tagName)) return;
                                if (params.colDef?.field === 'dueDate') return;
                                if (target.closest('.iconButton')) return;
                                if (params.column && params.column.colId === 'status') return;
                                if (target.tagName === 'SPAN' && target.style.backgroundColor) return;
                                if (target.closest('.ag-cell-inline-editing')) return;
                                if (target.closest('.ag-popup, .ag-select-list, .ag-list-item, .ag-cell-editor')) return;
                                const selection = window.getSelection();
                                if (selection && selection.toString().length > 0) return;

                                MoreDetails(params.data.taskId);
                            }}
                        />
                    </div>
                )}
            </div>

            {openDetails &&
                <TaskDetails
                    details={details}
                    isOpen={openDetails}
                    onClose={closeDetailsDiv}
                />
            }
        </>
    );
};

export default OverdueTasks;
