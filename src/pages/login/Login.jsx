import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { forgotPassword, loginUser } from '../../services/authService';
import { LockKeyhole, User, Eye, EyeOff } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import './Login.css';
import toast from 'react-hot-toast';


const Login = () => {

  const [searchParams] = useSearchParams();
  const message = searchParams.get('message');

  useEffect(() => {
    if (message === 'timeout') {
      toast.info("החיבור פג עקב חוסר פעילות");
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
      toast.success("התחברת בהצלחה!", { duration: 2000 });

      const userData = {
        ...data.user,
        token: data.token
      };

      login(userData);

      navigate('/tasks');
      
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'שגיאה בהתחברות', { duration: 3000 });

    }
  };
  const isForgotPassword = async () => {
    setForget(true);
  }
  const sendEmail = async () => {
    setForget(false);
    try {
      await forgotPassword(email);
      toast.success("קישור לאיפוס נשלח לאימייל שלך", { duration: 3000 });

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'כרגע אין אפשרות לשלוח קישור לאיפוס', { duration: 3000 });

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
