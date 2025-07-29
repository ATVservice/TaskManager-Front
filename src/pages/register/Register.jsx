import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { registerUser } from '../../services/authService';
import './Register.css';

const Register = () => {
  const { user } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('עובד');


  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const token = user?.token;

    try {
      await registerUser(username, firstName, lastName, password, email, role, token);
      alert("עובד נוסף בהצלחה!")

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'שגיאה בהתחברות');
    }
  };


  return (
    <div className="login-box" onSubmit={handleRegister}>
      <h2>הוספת עובד</h2>
      <form>
        <div className="user-box">
          <input type="text"
            value={username}
            required
            onChange={(e) => setUsername(e.target.value)} />
          <label>שם משתמש</label>
        </div>
        <div className="user-box">
          <input type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)} />
          <label>סיסמא</label>
        </div>
        <div className="user-box">
          <input type="text"
            value={firstName}
            required
            onChange={(e) => setFirstName(e.target.value)} />
          <label>שם פרטי</label>
        </div>
        <div className="user-box">
          <input type="text"
            value={lastName}
            required
            onChange={(e) => setLastName(e.target.value)} />
          <label>שם משפחה</label>
        </div>
        <div className="user-box">
          <input type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)} />
          <label>אימייל</label>
        </div>
        <div className="user-box">
          <label>סוג הרשאה</label>
          <select className='selectRole' value={role} required onChange={(e) => setRole(e.target.value)}>
            <option >עובד</option>
            <option >מנהל</option>
          </select>
        </div>
        <button type="submit">הוסף</button>
      </form>
    </div>
  );
};

export default Register;
