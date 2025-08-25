import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { forgotPassword, loginUser } from '../../services/authService';
import './Login.css';
import { LockKeyhole, User, Eye, EyeOff } from 'lucide-react';

import { TbWashDryP } from 'react-icons/tb';
import { useSearchParams } from 'react-router-dom';

const Login = () => {

  const [searchParams] = useSearchParams();
  const message = searchParams.get('message');

  useEffect(() => {
    if (message === 'timeout') {
      console.log("&&&&&");
      alert('החיבור פג עקב חוסר פעילות');
    }
  }, [message]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [forget, setForget] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser(username, password);
      const userData = {
        ...data.user,
        token: data.token
      };

      login(userData);

      if (userData.role === 'admin') {
        navigate('/association');
      } else {
        navigate('/tasks');
      }

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'שגיאה בהתחברות');
    }
  };
  const isForgotPassword = async () => {
    setForget(true);
  }
  const sendEmail = async () => {
    setForget(false);
    try {
      await forgotPassword(email);
      alert("קישור איפוס נשלח לאימייל שלך")
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'כרגע אין אפשרות לשלוח קישור לאיפוס');
    }
  }

  return (
    <div className="wrapper">
      <div className="login-page">
        <div className="login-card">
          <h1>ברוך הבא</h1>

          <form className="form" onSubmit={handleLogin}>
            <div className="input-wrapper">
              <User className="input-icon" />
              <input
                type="text"
                placeholder="שם משתמש"
                value={username}
                required
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="input-wrapper password-box">
              <LockKeyhole className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="סיסמא"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <button type="submit" id="login-button">התחבר</button>
            <a onClick={isForgotPassword} className='forgot'>שכחת סיסמא?</a>
            {forget && (
              <>
                <div className="input-wrapper">

                  <input
                    type="text"
                    placeholder="הכנס אימייל"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button type="button" className='sendLink' onClick={sendEmail}>שלח קישור</button>
              </>
            )}


          </form>
        </div>

        <ul className="bg-bubbles">
          {[...Array(10)].map((_, i) => <li key={i}></li>)}
        </ul>
      </div>
    </div>
  );
};

export default Login;
