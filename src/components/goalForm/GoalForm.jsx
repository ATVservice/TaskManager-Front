import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { getUserNames } from "../../services/userService";
import { AuthContext } from "../../context/AuthContext";
import { createGoal } from "../../services/goalService";
import './GoalForm.css'

export default function GoalForm() {
    const { user } = useContext(AuthContext);
    const allImportanceOptions = ["עקביות", "כללי", "תאריך", "מגירה", "מיידי"];
    const allSubImportanceOptions = ["לפי תאריך", "בהקדם האפשרי", "ממוספר", "דחוף"];



    const [formData, setFormData] = useState({
        targetType: "",
        importance: "",
        subImportance: "",
        frequency: "יומי",
        targetCount: 0,
        employee: ""
    });
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        const token = user?.token;

        async function fetchUsers() {
            try {
                const users = await getUserNames(token);
                setEmployees(users);
                console.log("allUsers", users);
            } catch (err) {
                console.error("שגיאה בשליפת משתמשים:", err);
                if (err.response?.status === 401) {
                    alert("הגישה נדחתה. אנא התחבר שוב.");
                } else {
                    console.error("שגיאה בלתי צפויה:", err);
                    alert("אירעה שגיאה בשליפת המשתמשים.");
                }
            }
        }

        fetchUsers();
    }, []);

    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        const token = user?.token;
        e.preventDefault();
        const dataToSend = { ...formData };
        if (!dataToSend.subImportance) {
            delete dataToSend.subImportance;
        }
        if (!dataToSend.employee) {
            delete dataToSend.employee;
        }
        try {
            await createGoal(dataToSend, token)
            alert("היעד נשמר בהצלחה!");
            setFormData({
                targetType: "",
                importance: "",
                subImportance: "",
                frequency: "יומי",
                targetCount: 0,
                employee: ""
            });

        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'שגיאה בשמירת היעד');
        }
    };

    return (
        <div className="association-page-wrapper">
            <form onSubmit={handleSubmit} className="goal-form">
                <h3>הגדרת יעדים</h3>
                <select name="targetType" value={formData.targetType} onChange={handleChange} required className="goal-form__select">
                    <option value="">בחר סוג יעד</option>
                    <option value="עובד בודד">עובד בודד</option>
                    <option value="כלל העובדים">כלל העובדים</option>
                </select>
                {formData.targetType == "עובד בודד" &&
                    <select name="employee" value={formData.employee} onChange={handleChange} className="goal-form__select">
                        <option value="">כל העובדים</option>
                        {employees.map(emp => (
                            <option key={emp._id} value={emp._id}>
                                {emp.userName}
                            </option>
                        ))}
                    </select>}

                <select name="importance" value={formData.importance} onChange={handleChange} className="goal-form__select">
                    <option value="">בחר רמת חשיבות</option>
                    {allImportanceOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt} </option>
                    ))}
                </select>
                {formData.importance === "מיידי" &&
                    <div>
                        <select name="subImportance" value={formData.subImportance} onChange={handleChange} className="goal-form__select">
                            <option value="">בחר תת דירוג</option>
                            {allSubImportanceOptions.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                }

                <select name="frequency" value={formData.frequency} onChange={handleChange} required className="goal-form__select">
                    <option value="יומי">יומי</option>
                    <option value="שבועי">שבועי</option>
                    <option value="חודשי">חודשי</option>
                </select>
                <label>בחר כמות יעד</label>

                <input
                    type="number"
                    name="targetCount"
                    placeholder="כמות יעד"
                    value={formData.targetCount}
                    onChange={handleChange}
                    min={0}
                    required
                    className="goal-form__input"
                />



                <button type="submit" className="goal-form__button">שמור יעד</button>
            </form>
        </div>
    );
}
