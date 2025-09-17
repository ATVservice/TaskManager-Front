import { useState, useEffect, useContext } from "react";
import { getUserNames } from "../../services/userService";
import { AuthContext } from "../../context/AuthContext";
import { createGoal } from "../../services/goalService";
import './GoalForm.css'
import toast from "react-hot-toast";
import { Title } from "react-head";

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
            } catch (err) {
                console.error("שגיאה בשליפת משתמשים:", err);
                if (err.response?.status === 401) {
                    toast.error("הגישה נדחתה. אנא התחבר שוב.", { duration: 3000 });

                } else {
                    console.error("שגיאה בלתי צפויה:", err);
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
            toast.success("היעד נשמר בהצלחה", { duration: 2000 });
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
            toast.error(err.response?.data?.message || "לא ניתן לשמור יעד כרגע", { duration: 3000 });
        }
    };

    return (
        <>
            <Title>הגדרת יעדים</Title>

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
        </>
    );
}
