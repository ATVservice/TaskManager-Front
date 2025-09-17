import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { forgotPassword, loginUser } from '../../services/authService';
import { LockKeyhole, User, Eye, EyeOff } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import '../login/Login.css';
import toast from 'react-hot-toast';
import { Title } from 'react-head';


const ResetEmailForm = () => {


    const [email, setEmail] = useState('');
    const navigate = useNavigate();


    const sendEmail = async () => {
        try {
            await forgotPassword(email);
            toast.success("קישור לאיפוס נשלח לאימייל שלך", { duration: 3000 });

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'כרגע אין אפשרות לשלוח קישור לאיפוס', { duration: 3000 });

        }
    }

    return (
        <>
            <Title>איפוס סיסמא</Title>

            <div className="wrapper">
                <div className="login-page">
                    <div className="login-card">
                        <h1>איפוס סיסמא</h1>

                        <form className="form">

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

                        </form>
                    </div>

                    <ul className="bg-bubbles">
                        {[...Array(10)].map((_, i) => <li key={i}></li>)}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default ResetEmailForm;
