import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { loginUser } from '../../services/authService';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser(username, password); // קריאה לשרת
      const userData = {
        ...data.user,
        token: data.token
      };

      login(userData); // שמירה ב-context + localStorage (כמו שהגדרת ב-AuthContext)

      // ניתוב לפי role
      if (userData.role === 'admin') {
        navigate('/association');
      } else {
        navigate('/mytasks');
      }

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'שגיאה בהתחברות');
    }
  };


  return (
    <div className="wrapper">
      <div className="container">
        <h1>ברוך הבא</h1>

        <form className="form" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="שם משתמש"
            value={username}
            required
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="סיסמא"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" id="login-button">התחבר</button>
        </form>
      </div>

      <ul className="bg-bubbles">
        {[...Array(10)].map((_, i) => <li key={i}></li>)}
      </ul>
    </div>
  );
};

export default Login;
