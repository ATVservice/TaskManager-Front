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
import toast from 'react-hot-toast';

const EmployeeManagement = () => {

    const { user } = useContext(AuthContext);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [showRegister, setShowRegister] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [editingEmployeeId, setEditingEmployeeId] = useState(null);

    const [columns] = useState([
        {
            headerName: "שם משתמש", field: 'userName',
            minWidth: 150,
            flex: 1,
            cellStyle: () => {
                return {
                    color: 'rgb(28, 125, 4)',
                };
            }
        },
        {
            headerName: 'שם פרטי', field: 'firstName',
            minWidth: 150,
            flex: 1,
            cellStyle: () => {
                return {
                    color: 'rgb(4, 125, 54)',
                };
            }
        },
        {
            headerName: 'שם משפחה', field: 'lastName',
            minWidth: 150,
            flex: 1,
            cellStyle: () => {
                return {
                    color: 'rgb(4, 105, 125)',
                };
            }
        },
        {
            headerName: 'אימייל', field: 'email',
            minWidth: 250,
            flex: 1,
            cellStyle: () => {
                return {
                    color: 'rgb(61, 41, 193)',
                };
            }
        },
        {
            headerName: 'כניסה אחרונה', field: 'lastLogin',
            minWidth: 150,
            flex: 1,
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
            headerName: "", field: "target",
            maxWidth: 50,
            minWidth: 50,
            flex: 1,

            cellRenderer: (params) => <div className='Target iconBtn' title='צפייה ביעדים'><Target size={17} color="black" onClick={() => toTarget(params.data._id)} style={{ cursor: "pointer" }} /></div>
        },

        {
            headerName: "", field: "edit",
            maxWidth: 50,
            minWidth: 50,
            flex: 1,

            cellRenderer: (params) => <div className='Pencil iconBtn' title='ערוך'><Pencil size={17} color="black" onClick={() => toEdit(params.data, params.data._id)} style={{ cursor: "pointer" }} /></div>
        },

        {
            headerName: "", field: "delete",
            maxWidth: 50,
            minWidth: 50,
            flex: 1,
            cellRenderer: (params) => <div className='Trash iconBtn' title='מחק'><Trash size={17} color="black" onClick={() => toDelete(params.data._id)} style={{ cursor: "pointer" }} /></div>
        },



    ]);
    const toEdit = (employee, employeeId) => {
        if (!employee) {
            toast.success("עובד לא נמצא", { duration: 3000 });
            return;
        }

        setEditingEmployee(employee);
        setEditingEmployeeId(employeeId);

        setShowRegister(true);
    };

    const toDelete = async (id) => {
        const token = user?.token;
        if (!token) {
            return toast.error("עלייך להתחבר מחדש", { duration: 3000 });
        }

        try {
            await deleteUser(id, token);
            toast.success("נמחק בהצלחה", { duration: 3000 });
            await fetchEmployees();
        }
        catch (err) {
            toast.error(err.response?.data?.message || "שגיאה, נסה מאוחר יותר", { duration: 3000 });
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
            toast.error(err.response?.data?.message || "שגיאה בטעינת עובדים", { duration: 3000 });
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
        if (!token) {
            return toast.error("עלייך להתחבר מחדש", { duration: 3000 });
        }

        try {
            if (editingEmployee) {
                console.log('Going to UPDATE mode');
                await updateUser(editingEmployeeId, formData, token);
                toast.success("עודכן בהצלחה", { duration: 3000 });
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
                toast.success("נוסף בהצלחה", { duration: 3000 });
            }

            setShowRegister(false);
            setEditingEmployee(null);
            setEditingEmployeeId(null)
            await fetchEmployees();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "שגיאה בטעינת עובד", { duration: 3000 });
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
                <div className='empBTN'>

                    <button className="add-task-button1"
                        onClick={() => {
                            setShowRegister(true);
                        }}
                    >
                        <Plus size={20} color="#fafafa" /> הוסף עובד
                    </button>
                    <button className="add-task-button1"
                        onClick={() => {
                            const user = JSON.parse(localStorage.getItem("user"));
                            toEdit(user, user?.id);
                        }}                    >
                        <Pencil size={20} color="#fafafa" /> פרטים אישיים
                    </button>
                </div>

            </div>
            <div>
                <SimpleAgGrid rowData={filteredData} columnDefs={columns} />
            </div>

            {showRegister && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <Register
                            key={editingEmployee ? editingEmployeeId : 'new'}
                            existingUser={editingEmployee}
                            onClose={() => {
                                setShowRegister(false);
                                setEditingEmployee(null);
                                setEditingEmployeeId(null)
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
