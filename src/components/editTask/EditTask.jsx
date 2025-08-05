import React, { useContext, useEffect, useState } from "react";
import MultiSelect from "../multiSelect/MultiSelect";
import { getUserNames } from '../../services/userService';
import { fetchAllAssociations } from '../../services/associationService';
import { updateTask } from '../../services/updateService';
import { AuthContext } from "../../context/AuthContext";
import "../createTask/CreateTask.css";
const EditTask = ({ onClose, onTaskUpdated, taskToEdit }) => {
    console.log("לפני", taskToEdit)
    const { user } = useContext(AuthContext);
    const [allUsers, setAllUsers] = useState([]);
    const [associations, setAssociations] = useState([]);

    const allImportanceOptions = ["עקביות", "כללי", "תאריך", "מגירה", "מיידי"];
    const allSubImportanceOptions = ["לפי תאריך", "בהקדם האפשרי", "ממוספר", "דחוף"];
    const frequencyTypeOptions = ["שנתי", "חודשי", "יומי פרטני", "יומי"];

    const weekDays = [
        { label: "ראשון", value: 0 },
        { label: "שני", value: 1 },
        { label: "שלישי", value: 2 },
        { label: "רביעי", value: 3 },
        { label: "חמישי", value: 4 },
        { label: "שישי", value: 5 },
    ];
    const months = [
        { label: "ינואר", value: 1 },
        { label: "פברואר", value: 2 },
        { label: "מרץ", value: 3 },
        { label: "אפריל", value: 4 },
        { label: "מאי", value: 5 },
        { label: "יוני", value: 6 },
        { label: "יולי", value: 7 },
        { label: "אוגוסט", value: 8 },
        { label: "ספטמבר", value: 9 },
        { label: "אוקטובר", value: 10 },
        { label: "נובמבר", value: 11 },
        { label: "דצמבר", value: 12 },


    ];

    const [form, setForm] = useState(null);

    // שליפת נתונים
    useEffect(() => {
        const token = user?.token;
        getUserNames(token).then(setAllUsers).catch(console.error);
        fetchAllAssociations(token).then(setAssociations).catch(console.error);
    }, []);

    // מילוי הטופס לפי המשימה לעריכה
    useEffect(() => {
        if (taskToEdit && allUsers.length > 0) {
            const formatDate = (dateStr) => dateStr?.split("T")[0];
            setForm({
                ...taskToEdit,
                dueDate: formatDate(taskToEdit.dueDate),
                finalDeadline: formatDate(taskToEdit.finalDeadline),
                assignees: allUsers.filter((u) => taskToEdit.assignees.includes(u._id)),
                mainAssignee: allUsers.find((u) => u._id === taskToEdit.mainAssignee?._id),
                organization: taskToEdit.organization,
                frequencyDetails: taskToEdit.frequencyDetails || {},
            });
        }
    }, [taskToEdit, allUsers]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = user?.token;
        try {
            const preparedForm = {
                ...form,
                assignees: form.assignees.map(u => u._id),
            };
            console.log("אחרי", preparedForm)
            await updateTask(taskToEdit._id, preparedForm, token);
            alert("המשימה עודכנה בהצלחה!");
            onTaskUpdated();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || "שגיאה בעדכון המשימה");
            console.error("Update error:", error);
        }
    };

    if (!form) return <div>טוען...</div>;

    return (
        <div className="create-task-container">
            <h4>עריכת משימה</h4>
            <form onSubmit={handleSubmit}>
                <div className="form-row">

                    <div className="form-group">
                        <label>כותרת</label>

                        <input name="title" value={form.title} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>פרטים</label>

                        <input name="details" value={form.details} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>פרויקט</label>
                        <input
                            id="project"
                            name="project"
                            value={form.project}
                            onChange={handleChange}
                        />
                    </div>

                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>אחראיים</label>
                        <MultiSelect
                            className="select-multiple"
                            options={allUsers}
                            selected={form.assignees}
                            onChange={(newSelected) =>
                                setForm((prev) => ({ ...prev, assignees: newSelected }))
                            }
                        />
                    </div>
                    <div className="form-group">
                        <label>עמותה</label>
                        <select name="organization" value={form.organization?._id || ""}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    organization: associations.find((a) => a._id === e.target.value)
                                }))
                            }

                        >
                            {associations.map((association) => (
                                <option key={association._id} value={association._id}>
                                    {association.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>תאריך יעד</label>

                        <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange}
                            min={new Date().toISOString().split("T")[0]} />
                    </div>

                </div>
                <div className="form-row">

                    <div className="form-group">
                        <label>אחראי ראשי</label>
                        <select
                            name="mainAssignee"
                            value={form.mainAssignee?._id || ""}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    mainAssignee: allUsers.find((u) => u._id === e.target.value)
                                }))
                            }

                        >
                            {form.assignees.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.userName}
                                </option>
                            ))}
                        </select>

                    </div>

                    <div className="form-group">
                        <label>רמת חשיבות</label>
                        <select
                            name="importance"
                            value={form.importance || ""}
                            onChange={handleChange}

                        >
                            {allImportanceOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>

                    </div>
                    {form.dueDate &&
                        <div className="form-group">
                            <label>תאריך סופי</label>

                            <input type="date" name="finalDeadline" value={form.finalDeadline} onChange={handleChange}
                                min={form.dueDate} />
                        </div>}


                </div>
                <div className="form-row">


                    {/* <div className="form-group">
                        <label htmlFor="isRecurring">משימה קבועה?</label>
                        <input
                            id="isRecurring"
                            type="checkbox"
                            name="isRecurring"
                            checked={form.isRecurring}
                            onChange={handleChange}
                        />
                    </div> */}
                    <div className="form-group"></div>

                    {form.importance === "מיידי" &&
                        <div className="form-group">
                            <label>תת דירוג</label>
                            <select
                                name="subImportance"
                                value={form.subImportance || ""}
                                onChange={handleChange}

                            >
                                {allImportanceOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>

                        </div>
                    }


                </div>
                <div className="form-row">
                    {form.isRecurring && (
                        <div>
                            <div className="form-group">
                                <label htmlFor="frequencyType">סוג תדירות</label>
                                <select name="frequencyType" value={form.frequencyType} onChange={handleChange} >
                                    <option value="">בחר</option>
                                    {frequencyTypeOptions.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                            {form.frequencyType &&
                                <div className="form-group">
                                    <label htmlFor="frequencyDetails">פרטי תדירות</label>
                                    {form.frequencyType === "יומי" && (
                                        <label>
                                            כולל ימי שישי?
                                            <input
                                                type="checkbox"
                                                checked={form.frequencyDetails.includingFriday || false}
                                                onChange={(e) =>
                                                    setForm(prev => ({
                                                        ...prev,
                                                        frequencyDetails: {
                                                            ...prev.frequencyDetails,
                                                            includingFriday: e.target.checked
                                                        }
                                                    }))
                                                }
                                            />
                                        </label>

                                    )}
                                    {form.frequencyType === "יומי פרטני" && (
                                        <div className="form-group">
                                            <label>בחר ימים:</label>
                                            {weekDays.map((day) => (
                                                <label key={day.value} style={{ marginInlineEnd: '8px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={form.frequencyDetails.days.includes(day.value)}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setForm((prev) => {
                                                                const prevDays = prev.frequencyDetails.days || [];
                                                                const newDays = checked
                                                                    ? [...prevDays, day.value]
                                                                    : prevDays.filter((v) => v !== day.value);
                                                                return {
                                                                    ...prev,
                                                                    frequencyDetails: {
                                                                        ...prev.frequencyDetails,
                                                                        days: newDays,
                                                                    },
                                                                };
                                                            });
                                                        }}
                                                    />
                                                    {day.label}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    {form.frequencyType === 'חודשי' && (
                                        <div className="form-group">

                                            <label>בחר יום:</label>
                                            <select
                                                value={form.frequencyDetails.dayOfMonth}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        frequencyDetails: {
                                                            ...prev.frequencyDetails,
                                                            dayOfMonth: Number(e.target.value),
                                                        },
                                                    }))
                                                }
                                            >
                                                <option value="">--בחר יום--</option>
                                                {Array.from({ length: 31 }, (_, i) => i + 1).map((dayOfMonth) => (
                                                    <option key={dayOfMonth} value={dayOfMonth}>
                                                        {dayOfMonth.toString().padStart(2, "0")}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    {form.frequencyType === 'שנתי' && (
                                        <div className="form-group">
                                            <label>בחר חודש:</label>
                                            <select
                                                value={form.frequencyDetails.month}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        frequencyDetails: {
                                                            ...prev.frequencyDetails,
                                                            month: Number(e.target.value),
                                                        },
                                                    }))
                                                }
                                            >
                                                <option value="">--בחר חודש--</option>
                                                {months.map((month) => (
                                                    <option key={month.value} value={month.value}>
                                                        {month.label}
                                                    </option>
                                                ))}
                                            </select>


                                            <label>בחר יום:</label>
                                            <select
                                                value={form.frequencyDetails.day}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        frequencyDetails: {
                                                            ...prev.frequencyDetails,
                                                            day: Number(e.target.value),
                                                        },
                                                    }))
                                                }
                                            >
                                                <option value="">--בחר יום--</option>
                                                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                                    <option key={day} value={day}>
                                                        {day.toString().padStart(2, "0")}
                                                    </option>
                                                ))}
                                            </select>

                                        </div>
                                    )}
                                </div>
                            }
                        </div>
                    )}
                    <div className="form-group"></div>

                    <div className="form-group">
                        <button type="submit">עדכן</button>
                    </div>

                </div>
            </form>
        </div>
    );
};

export default EditTask;
