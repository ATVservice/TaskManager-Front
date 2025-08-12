import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../../services/authService";
import './ResetPassword.css'

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!newPassword || !confirmPassword) {
      setError("אנא מלא/י את כל השדות");
      return false;
    }
    if (newPassword.length < 8) {
      setError("הסיסמה חייבת להכיל לפחות 8 תווים");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("הסיסמאות לא תואמות");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);

    try {
      await resetPassword(token, newPassword)

      setSuccess("הסיסמה עודכנה בהצלחה. מועבר/ת להתחברות...");

      setTimeout(() => {
        navigate("/login", { state: { message: "הסיסמה שונתה. התחברי בעזרת הסיסמה החדשה." } });
      }, 1800);
    } catch (err) {
        alert(error.response?.data?.message || 'שגיאה ביצירת סיסמא חדשה');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-wrapper">
      <div className="eset-password-container">
        <h2 className="reset-password-title">איפוס סיסמה</h2>

        {error && (
          <div className="message-box error">{error}</div>
        )}

        {success ? (
          <div className="message-box success">{success}</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="reset-password-form">סיסמה חדשה</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="הכנס סיסמה חדשה"
              disabled={loading}
            />

            <label>אישור סיסמה</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="הכנס שוב את הסיסמה"
              disabled={loading}
            />

            <button
              type="submit"
              className="reset-password-button"
              disabled={loading}
            >
              {loading ? "שולח..." : "אפס סיסמה"}
            </button>

            <p className="info-text" >הקישור תקף ל-30 דקות בלבד.</p>
          </form>
        )}
      </div>
    </div>
  );
}
