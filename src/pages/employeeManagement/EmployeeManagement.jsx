import React, { useEffect, useState } from 'react';
import SimpleAgGrid from '../../components/simpleAgGrid/SimpleAgGrid.jsx'
import { AuthContext } from '../../context/AuthContext.jsx';
import { Pencil, Plus, Search, Target, Trash } from 'lucide-react';
import { useContext } from 'react';
import { deleteUser, getAllEmployees, updateUser } from '../../services/userService.js';
import Register from '../register/Register.jsx';
import TargetModal from '../../components/targetModal/TargetModal.jsx';
import { registerUser } from '../../services/authService.js';
import './EmployeeManagement.css';


const EmployeeManagement = () => {

    const { user } = useContext(AuthContext);

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [showRegister, setShowRegister] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);




    const [columns] = useState([

        {
            headerName: "", field: "delete", maxWidth: 50,

            cellRenderer: (params) => <div className='Trash iconBtn'><Trash size={17} color="black" onClick={() => toDelete(params.data._id)} /></div>
        },
        {
            headerName: "", field: "edit", maxWidth: 50,

            cellRenderer: (params) => <div className='Pencil iconBtn'><Pencil className='Pencil iconBtn' size={17} color="black" onClick={() => toEdit(params.data)} /></div>
        },
        {
            headerName: "", field: "target", maxWidth: 50,

            cellRenderer: (params) => <div className='Target iconBtn'><Target className='Target iconBtn' size={17} color="black" onClick={() => toTarget(params.data._id)} /></div>
        },
        {
            headerName: 'כניסה אחרונה', field: 'lastLogin',
            valueFormatter: (params) => {
                if (!params.value) return '';
                return new Date(params.value).toLocaleString('he-IL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            },
            cellStyle: () => {
                return {
                    color: 'rgb(109, 24, 179)',
                };
            }
        },
        {
            headerName: 'אימייל', field: 'email',
            cellStyle: () => {
                return {
                    color: 'rgb(61, 41, 193)',
                };
            }
        },
        {
            headerName: 'שם משפחה', field: 'lastName',
            cellStyle: () => {
                return {
                    color: 'rgb(4, 105, 125)',
                };
            }
        },
        {
            headerName: 'שם פרטי', field: 'firstName',
            cellStyle: () => {
                return {
                    color: 'rgb(4, 125, 54)',
                };
            }
        },
        {
            headerName: "שם משתמש", field: 'userName',
            cellStyle: () => {
                return {
                    color: 'rgb(28, 125, 4)',
                };
            }
        },


    ]);
    const toEdit = (employee) => {
        console.log('toEditDirect called with employee:', employee);

        if (!employee) {
            alert('לא נמצא עובד לעריכה.');
            return;
        }

        setEditingEmployee(employee);
        setShowRegister(true);
    };

    const toDelete = async (id) => {
        const token = user?.token;
        if (!token) return alert('אין טוקן');
        try {
            await deleteUser(id, token);
            alert('העובד נמחק בהצלחה!');
            await fetchEmployees();
        }
        catch (err) {
            alert(err.response?.data?.message || 'שגיאה במחיקת עובד');
            console.error('שגיאה במחיקת עובד', err);
        }

    }
    const toTarget = async (employeeId) => {
        setSelectedEmployee(employeeId);
    };

    const fetchEmployees = async () => {
        const token = user?.token;
        if (!token) return;
        try {
            const allEmployees = await getAllEmployees(token);
            setData(allEmployees);
            setFilteredData(allEmployees);
        } catch (err) {
            alert(err.response?.data?.message || 'שגיאה בטעינת עובדים');
            console.error('שגיאה בטעינת עובדים ', err);
        }
    };

    useEffect(() => { fetchEmployees(); }, [user]);

    useEffect(() => {
        const lower = keyword.toLowerCase();
        setFilteredData(
            data.filter(emp =>
                emp.userName?.toLowerCase().includes(lower) ||
                emp.firstName?.toLowerCase().includes(lower) ||
                emp.lastName?.toLowerCase().includes(lower) ||
                emp.email?.toLowerCase().includes(lower)
            )
        );
    }, [keyword, data]);

    const handleSubmitUser = async (formData) => {
        console.log('handleSubmitUser called');
        console.log('editingEmployee:', editingEmployee);
        console.log('formData:', formData);

        const token = user?.token;
        if (!token) return alert('אין טוקן');

        try {
            if (editingEmployee) {
                console.log('Going to UPDATE mode');
                await updateUser(editingEmployee._id, formData, token);
                alert('העובד עודכן בהצלחה!');
            } else {
                console.log('Going to ADD mode');
                await registerUser(
                    formData.userName,
                    formData.firstName,
                    formData.lastName,
                    formData.password,
                    formData.email,
                    formData.role,
                    token
                );
                alert('עובד נוסף בהצלחה!');
            }

            setShowRegister(false);
            setEditingEmployee(null);
            await fetchEmployees();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'שגיאה בשמירת עובד');
        }
    };

    return (
        <div>
            <div className="actions-bar">
                <div className="search-input-container">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="חיפוש"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="search-input"
                    />
                </div>

                <button className="add-task-button1"
                    onClick={() => {
                        setEditingEmployee(null);
                        setShowRegister(true);
                    }}
                >
                    <Plus size={20} color="#fafafa" /> הוסף עובד
                </button>

            </div>
            <div>
                <SimpleAgGrid rowData={filteredData} columnDefs={columns} />
            </div>

            {showRegister && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <Register
                            key={editingEmployee ? editingEmployee._id : 'new'}
                            existingUser={editingEmployee}
                            onClose={() => {
                                setShowRegister(false);
                                setEditingEmployee(null);
                            }}
                            onSubmit={handleSubmitUser}
                        />
                    </div>
                </div>
            )}

            {selectedEmployee && (
                <TargetModal
                    employeeId={selectedEmployee}
                    onClose={() => setSelectedEmployee(null)}
                />
            )}
        </div>
    );
};

export default EmployeeManagement;
