import React, { useContext, useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './NavBar.css';
import { Bell } from 'lucide-react';
import { fetchUserAlerts } from '../../services/alertService';
import AlertsDrawer from '../alertsDrawer/AlertsDrawer';

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);


  const loadUnreadCount = async () => {
    if (!user) return;
    try {
      const data = await fetchUserAlerts(user.token, { limit: 50 });
      const unread = data.alerts ? data.alerts.filter(a => !a.resolved).length : 0;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error fetching unread count', err);
    }
  };

  useEffect(() => {
    loadUnreadCount();
  }, [user]);


  if (!user) return null;

  return (
    <>

      <nav className='navbar'>
        <div className='rightProfile'>
          {user.role === 'עובד' && (
            <div className="user-profile-container">
              <span className="user-profile-name">שלום {user.userName}</span>
            </div>
          )}
        </div>

        <div className='nav-links'>
          <NavLink to="/tasks">משימות</NavLink>

          {user.role === 'מנהל' && (
            <NavLink to="/association">עמותות</NavLink>
          )}
          {user.role === 'מנהל' && (
            <NavLink to="/register">הוספת משתמש</NavLink>
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
            <button className="bell-btn" onClick={() => setDrawerOpen(true)} aria-label="התרעות">
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


    </>
  );
};

export default NavBar;
