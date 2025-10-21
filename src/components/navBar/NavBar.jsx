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
import { AlertContext } from '../../context/AlertContext';
import OverdueTasks from '../../pages/overdueTasks/OverdueTasks';
import { getOverdueTasks } from '../../services/overdueTasksService';

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { unreadCount, updateUnreadCount } = useContext(AlertContext);

  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [overOpen, setOverOpen] = useState(false);
  const [data, setData] = useState([]);
  const [showOverduePopup, setShowOverduePopup] = useState(false);

  useEffect(() => {
    if (data.length > 0) {
      setShowOverduePopup(true);
    } else {
      setShowOverduePopup(false);
    }
  }, [data]);




  const loadUnreadCount = async () => {
    if (!user) return;
    try {
      const data = await fetchUserAlerts(user.token, { limit: 100 });
      const unread = data.alerts ? data.alerts.filter(a => !a.resolved).length : 0;
      updateUnreadCount(unread);
    } catch (err) {
      console.error('Error fetching unread count', err);
    }
  };
  // משימות מתעכבות
  useEffect(() => {
    if (!user || !user.token) return;

    const GetOverdueTasks = async () => {
      try {
        const overdueTasks = await getOverdueTasks(user.token);
        setData(overdueTasks.tasks);
      } catch (err) {
        console.error('שגיאה בטעינת משימות מתעכבות', err);
      }
    };

    GetOverdueTasks();
  }, [user?.token]);

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
  const toOverOpen = () => {
    setOverOpen(true);
  }

  if (!user) return null;
  return (
    <>

      <nav className='navbar'>
        <div className='rightProfile'>

          <button className="user-profile-container"
            onClick={() => {
              const user = JSON.parse(localStorage.getItem("user"));
              toEdit(user, user?.id);
            }}
            style={{ cursor: "pointer" }} >
            <title>עריכת פרטים אישיים</title>
            <UserRoundPen color="#8011ee" size={20} />
            <span className="user-profile-name">
              {user.userName}
            </span>
          </button>
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
          {/* <div>
              <button onClick={toOverOpen}>מתעכבות</button>
            </div> */}
          <p>בדיקה! </p>
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

      {/* {overOpen && (
          <div className="overdue-overlay">
            <div className="overdue-popup">
            <OverdueTasks
                  data={data}
                          onTasksUpdate={(newData) => setData(newData)}

                />
            </div>
          </div>
        )} */}

      {showOverduePopup && (
        <div className="overdue-overlay">
          <div className="overdue-popup">
            <OverdueTasks
              tasks={data}
              onTasksUpdate={(newData) => setData(newData)}
            />
          </div>
        </div>
      )}


    </>
  );
};

export default NavBar;
