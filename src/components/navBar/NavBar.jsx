import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './NavBar.css';
import { Bell } from 'lucide-react';

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  return (
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


      </div>

      <div className='leftButton'>
        <div>
          <button className="logout-btn" onClick={logout}>התנתק</button>
        </div>
        <div className='bell'>  <Bell /></div>
      
      </div>
    </nav>
  );
};

export default NavBar;
