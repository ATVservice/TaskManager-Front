import React, { useContext, useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './NavBar.css';
import { Bell, UserRoundPen } from 'lucide-react';
import { fetchUserAlerts } from '../../services/alertService';
import AlertsDrawer from '../alertsDrawer/AlertsDrawer';
import Register from '../../pages/register/Register';
import toast from 'react-hot-toast';
import { updateUser } from '../../services/userService';

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [showRegister, setShowRegister] = useState(false);


  const loadUnreadCount = async () => {
    if (!user) return;
    try {
      const data = await fetchUserAlerts(user.token, { limit: 100 });
      const unread = data.alerts ? data.alerts.filter(a => !a.resolved).length : 0;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error fetching unread count', err);
    }
  };

  useEffect(() => {
    loadUnreadCount();
  }, [user]);

  const toEdit = (employee, employeeId) => {
    if (!employee) {
      toast.success("עובד לא נמצא", { duration: 3000 });
      return;
    }

    setEditingEmployee(employee);
    setEditingEmployeeId(employeeId);

    setShowRegister(true);
  };
  const handleSubmitUser = async (formData) => {
    console.log('handleSubmitUser called');
    console.log('editingEmployee:', editingEmployee);
    console.log('formData:', formData);

    const token = user?.token;
    if (!token) {
      return toast.error("עלייך להתחבר מחדש", { duration: 3000 });
    }

    try {
      await updateUser(editingEmployeeId, formData, token);
      toast.success("עודכן בהצלחה", { duration: 3000 });

      setShowRegister(false);
      setEditingEmployee(null);
      setEditingEmployeeId(null)
    }
     catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "שגיאה בטעינת עובד", { duration: 3000 });
  }
};


if (!user) return null;
return (
  <>

    <nav className='navbar'>
      <div className='rightProfile'>
        <div className="user-profile-container">
          <UserRoundPen color="#8011ee" size={20}
            onClick={() => {
              const user = JSON.parse(localStorage.getItem("user"));
              toEdit(user, user?.id);
            }}
            style={{ cursor: "pointer" }} />
          <span className="user-profile-name">
            {user.userName}
          </span>
        </div>

      </div>

      <div className='nav-links'>
        <NavLink to="/tasks">משימות</NavLink>

        {user.role === 'מנהל' && (
          <>
            <NavLink to="/association">עמותות</NavLink>
            <NavLink to="/goals">הגדרת יעדים</NavLink>
            <NavLink to="/employee">ניהול עובדים</NavLink>
            <NavLink to="/adminDashboard">דשבורד</NavLink>
            <NavLink to="/reports">דוחות</NavLink>

          </>
        )}

        {user.role === 'עובד' && (
          <NavLink to="/dashboard">דשבורד</NavLink>
        )}


      </div>

      <div className='leftButton'>
        <div>
          <button className="logout-btn" onClick={logout}>התנתק</button>
        </div>
        <div className='bell'>
          <button className="bell-btn" onClick={() => setDrawerOpen(true)} aria-label="התראות" title='התראות'>
            <Bell />
            {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
          </button>
        </div>
      </div>
    </nav>
    <AlertsDrawer
      open={drawerOpen}
      onClose={() => {
        setDrawerOpen(false);
      }}
      token={user?.token}
      onMarkedRead={loadUnreadCount} />

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
  </>
);
};

export default NavBar;
