import './Register.css';
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';


const Register = ({ onClose, onSubmit, existingUser }) => {

  const { user } = useContext(AuthContext);

  const [username, setUsername] = useState(existingUser?.userName || '');
  const [firstName, setFirstName] = useState(existingUser?.firstName || '');
  const [lastName, setLastName] = useState(existingUser?.lastName || '');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(existingUser?.email || '');
  const [role, setRole] = useState(existingUser?.role || 'עובד');


  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    if (existingUser) {
      setUsername(existingUser.userName || '');
      setFirstName(existingUser.firstName || '');
      setLastName(existingUser.lastName || '');
      setEmail(existingUser.email || '');
      setRole(existingUser.role || 'עובד');
      setPassword('');
    } else {
      setUsername('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setRole('עובד');
      setPassword('');
    }
  }, [existingUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({
      userName: username,
      firstName,
      lastName,
      email,
      role,
      ...(password ? { password } : {})
    });
  };
  const handleClose = () => {
    onClose();
  };

  return (
    <div className="login-box">
      <h2>{existingUser ? 'עריכת עובד' : 'הוספת עובד'}</h2>
      <button className="close-form" onClick={handleClose}>X</button>
      <form onSubmit={handleSubmit}>
        <div className="user-box">
          <input type="text"
            value={username}
            required
            onChange={(e) => setUsername(e.target.value)} />
          <label>שם משתמש</label>
        </div>
        <div className="user-box password-box">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            required={!existingUser}
            onChange={(e) => setPassword(e.target.value)} />
          <label>סיסמא</label>
          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
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
          <select className='selectRole' value={role} placeholder='fff' required onChange={(e) => setRole(e.target.value)}>
            <option value="עובד" >עובד</option>
            <option value="מנהל" >מנהל</option>
          </select>
        </div>
        <button type="submit">{existingUser ? 'עדכן' : 'הוסף'}</button>
      </form>
    </div>
  );
};

export default Register;
