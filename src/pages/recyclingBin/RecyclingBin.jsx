import './RecyclingBin.css';
import React, {  useEffect, useRef, useState } from 'react';
import SimpleAgGrid from '../../components/simpleAgGrid/SimpleAgGrid.jsx'
import Swal from 'sweetalert2';
import { fetchGetDeletedTasks, fetchRestoreTask } from '../../services/restoreService.js';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Recycle } from 'lucide-react';
import { useContext } from 'react';


const RecyclingBin = () => {

    const { user } = useContext(AuthContext);

    const [data, setData] = useState([]);

    const toRestoreTask = async(taskId)=> {
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
            
        } catch (err) {
            alert(err.response?.data?.message ||'שגיאה בשחזור משימה');
            console.error('שגיאה בשחזור משימה', err);
        }
    }


    const [columns] = useState([
        {
            headerName: "", field: "duplicate", maxWidth: 50,
           
            cellRenderer: (params) =>  <Recycle  size={20} color="#042486" onClick={() => toRestoreTask(params.data._id)} />
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
        // {
        //     headerName: 'פרטים', field: 'details', maxWidth: 100,
        //     cellRenderer: (params) => (
        //         <button className='details' onClick={() => MoreDetails(params.data._id)}>לפרטים</button>
        //     )
        // },

    ]);

        useEffect(() => {
            const GetDeletedTasks = async () => {
                const token = user?.token;
                if (!token) return;
                try {
                    const [deletedTasks] = await Promise.all([
                        fetchGetDeletedTasks(token),
                    ]);
    
                    setData(deletedTasks)
                } catch (err) {
                    alert(err.response?.data?.message ||'שגיאה בטעינת המשימות המחוקות');
                    console.error('שגיאה בטעינת משימות מחוקות', err);
                }
            };
    
            GetDeletedTasks();
        }, []);

    return (
        <div>
            <h2>סל מחזור</h2>
            <SimpleAgGrid rowData={data} columnDefs={columns} />
        </div>
    );
};

export default RecyclingBin;
