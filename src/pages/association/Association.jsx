import React, { useEffect, useState, useContext } from 'react';
import { fetchAllAssociations, fetchGetAssociatedEmployees, updateAssociationUsers } from '../../services/associationService.js';
import { getNames } from '../../services/userService';
import { AuthContext } from '../../context/AuthContext.jsx';
import './Association.css'
import { UserPlus, Users } from 'lucide-react';

const Association = () => {
  const { user } = useContext(AuthContext);
  const [associations, setAssociations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedAssociation, setSelectedAssociation] = useState(null);
  const [checkedUsers, setCheckedUsers] = useState([]);
  const [openAssignPopup, setOpenAssignPopup] = useState(false);
  const [associatedEmployees, setAssociatedEmployees] = useState([])
  const [openAssociatedEmployees, setOpenAssociatedEmployees] = useState(false);


  // שליפת עמותות
  useEffect(() => {
    const getAssociations = async () => {
      try {
        const data = await fetchAllAssociations(user?.token);
        setAssociations(data);
      } catch (error) {
        alert(error.response?.data?.message || 'שגיאה בשליפת העמותות');
      }
    };
    getAssociations();
  }, [user]);
  const getAssociatedEmployees = async (associationId) => {
    const token = user?.token;

    try {
      const dataE = await fetchGetAssociatedEmployees(associationId, token);
      setAssociatedEmployees(dataE);
      console.log("employees", associatedEmployees);
      setOpenAssociatedEmployees(true);
    } catch (error) {
      console.error('Error fetching associations:', error);
    }
  }
  const closeAssociatedEmployees = () => {
    setOpenAssociatedEmployees(false);
    setAssociatedEmployees([]);
  }

  // שליפת כל העובדים
  const loadUsers = async () => {
    try {
      const data = await getNames(user?.token);
      console.log("למה לא מוצג שמות?",data)
      setAllUsers(data);
    } catch (err) {
      alert(err.response?.data?.message || 'שגיאה בשליפת העובדים');
      console.error("שגיאה בשליפת עובדים:", err);
    }
  };

  // פתיחת פופאפ שיוך
  const openAssignEmployees = async (associationId) => {
    setSelectedAssociation(associationId);
    await loadUsers();

    // שליפת עובדים שכבר שייכים לעמותה
    const employees = await fetchGetAssociatedEmployees(associationId, user?.token);
    setCheckedUsers(employees.map(e => e._id)); // כברירת מחדל מסומן
    setOpenAssignPopup(true);
  };

  const toggleUserCheck = (userId) => {
    setCheckedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // שמירת השינויים
  const saveAssociationUsers = async () => {
    try {
      await updateAssociationUsers({
        userIds: checkedUsers,
        associationId: selectedAssociation
      }, user?.token);

      alert("השיוך נשמר בהצלחה");
      setOpenAssignPopup(false);
      setCheckedUsers([]);
      setSelectedAssociation(null);
    } catch (err) {
      alert(err.response?.data?.message || 'שגיאה בשיוך עובדים ');
      console.error("שגיאה בשמירת שיוך:", err);
    }
  };

  return (
    <div className="association-container">
      <h2>רשימת עמותות</h2>

      <table className="association-table">
        <thead>
          <tr>
            <th>שם עמותה</th>
            <th>עובדים משוייכים</th>
            <th>שיוך עובדים</th>
          </tr>
        </thead>
        <tbody>
          {associations.map((asso) => (
            <tr key={asso._id}>
              <td>{asso.name}</td>
              <td>
                <button className="association-btn secondary"
                  onClick={() => getAssociatedEmployees(asso._id)} >
                    <Users color="#050505" />
                  </button>
              </td>
              <td>
                <button className="association-btn primary"
                  onClick={() => openAssignEmployees(asso._id)}>
                    <UserPlus color="#fcfcfc" />
                  </button>
                  
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {openAssociatedEmployees && (
        <div className="popup-overlay">
          <div className="popup">
            <button
              className="popup-close"
              onClick={closeAssociatedEmployees}>X</button>

            <h3>עובדים משויכים</h3>
            {associatedEmployees.length > 0 ? (
              <ul className="employee-list">
                {associatedEmployees.map((emp) => (
                  <li key={emp._id}>{emp.userName} ({emp.firstName} {emp.lastName})</li>
                ))}
              </ul>
            ) : (
              <p className="empty-text">אין עובדים משויכים לעמותה זו</p>
            )}
          </div>
        </div>
      )}

      {openAssignPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>שיוך עובדים לעמותה</h3>
            {allUsers.map(u => (
              <div key={u._id}>
                <label>
                  <input
                    type="checkbox"
                    checked={checkedUsers.includes(u._id)}
                    onChange={() => toggleUserCheck(u._id)}
                  />
                  {u.userName} ({u.firstName} {u.lastName})
                </label>
              </div>
            ))}
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <button className="association-btn primary" onClick={saveAssociationUsers}>שמור</button>
              <button className="association-btn secondary" onClick={() => setOpenAssignPopup(false)}>סגור</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Association;
