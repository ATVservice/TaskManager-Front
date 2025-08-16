import './EmployeeManagement.css';
import React, { useEffect, useRef, useState } from 'react';
import SimpleAgGrid from '../../components/simpleAgGrid/SimpleAgGrid.jsx'
import { AuthContext } from '../../context/AuthContext.jsx';
import { Pencil, Trash } from 'lucide-react';
import { useContext } from 'react';
import { getAllEmployees } from '../../services/userService.js';
import Register from '../register/Register.jsx';


const EmployeeManagement = () => {

    const { user } = useContext(AuthContext);

    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [showRegister, setShowRegister] = useState(false);



    const [columns] = useState([

        {
            headerName: "", field: "edit", maxWidth: 50,

            cellRenderer: (params) => <Trash size={20} color="#042486" onClick={() => toDelete(params.data._id)} />
        },
        {
            headerName: "", field: "edit", maxWidth: 50,

            cellRenderer: (params) => <Pencil size={20} color="#042486" onClick={() => toEdit(params.data._id)} />
        },
        { headerName: 'כניסה אחרונה', field: 'lastLogin', 
            valueFormatter: (params) => {
              if (!params.value) return '';
              return new Date(params.value).toLocaleString('he-IL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
            }
          }, 
          { headerName: 'אימייל', field: 'email' },
          { headerName: 'שם משפחה', field: 'lastName' },
          { headerName: 'שם פרטי', field: 'firstName' },
          { headerName: "שם משתמש", field: 'userName' },


    ]);
    const toEdit = async () => {
        alert("עריכת משתמש תתממשק בהמשך")
    }
    const toDelete = async () => {
        alert("מחיקת משתמש תתממשק בהמשך")
    }


    useEffect(() => {
        const GetAllEmployees = async () => {
            const token = user?.token;
            if (!token) return;
            try {
                const [allEmployees] = await Promise.all([
                    getAllEmployees(token),
                ]);

                setData(allEmployees)
                setFilteredData(allEmployees);
            } catch (err) {
                alert(err.response?.data?.message || 'שגיאה בטעינת עובדים');
                console.error('שגיאה בטעינת עובדים ', err);
            }
        };

        GetAllEmployees();
    }, [user]);

    useEffect(() => {
        const lowerKeyword = keyword.toLowerCase();
        const filtered = data.filter(emp =>
            emp.userName?.toLowerCase().includes(lowerKeyword) ||
            emp.firstName?.toLowerCase().includes(lowerKeyword) ||
            emp.lastName?.toLowerCase().includes(lowerKeyword) ||
            emp.email?.toLowerCase().includes(lowerKeyword)
        );
        setFilteredData(filtered);
    }, [keyword, data]);

    return (
        <div>
            <div className="actions-bar">
                <input
                    type="text"
                    placeholder="חיפוש"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="search-input"
                />
                <button className="add-user-btn" onClick={() => setShowRegister(true)}>➕ הוסף עובד</button>

            </div>
            <div>
                <SimpleAgGrid rowData={filteredData} columnDefs={columns} />
            </div>
            {showRegister && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <Register onClose={() => setShowRegister(false)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeManagement;
