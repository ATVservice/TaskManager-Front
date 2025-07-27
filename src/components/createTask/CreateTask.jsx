import React, { useEffect, useState } from "react";
import MultiSelect from "../multiSelect/MultiSelect";
import { getUserNames } from '../../services/userService';
import { fetchAllAssociations } from '../../services/associationService';
import { createTask } from '../../services/taskService';


import "./CreateTask.css";

function CreateTask() {

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
    const [form, setForm] = useState({
        title: "",
        details: "",
        dueDate: "",
        finalDeadline: "",
        importance: "",
        subImportance: "",
        assignees: [],
        mainAssignee: "",
        organization: "",
        project: "",
        isRecurring: false,
        frequencyType: "",
        frequencyDetails: {
            days: []
        },
    });
    const [allUsers, setAllUsers] = useState([]);
    useEffect(() => {
        async function fetchUsers() {
            try {
                const users = await getUserNames();
                console.log("!!!!!", users);
                setAllUsers(users);
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
    useEffect(() => {
        const getAssociations = async () => {
            try {
                const data = await fetchAllAssociations();
                setAssociations(data);
            } catch (error) {
                console.error('Error fetching associations:', error);
            }
        };

        getAssociations();
    }, []);


    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };


    const handleSubmit =async (e) => {
        e.preventDefault();
        try {
            await createTask(form);
            alert("משימה נוצרה בהצלחה!");
        } catch (error) {
            alert("שגיאה!");
            console.error('Error adding task:', error);
        }
       
        console.log("form", form);
    };

    return (
        <div>
            <h2>צור משימה</h2>
            <form onSubmit={handleSubmit}>

                <div>
                    <input name="title" value={form.title} onChange={handleChange} required />
                    <label>כותרת</label>
                </div>

                <div>
                    <label>אחראיים</label>
                    <MultiSelect
                        required
                        options={allUsers}
                        selected={form.assignees}
                        onChange={(newSelected) =>
                            setForm((prev) => ({ ...prev, assignees: newSelected }))
                        }
                    />
                </div>

                    <div>
                        <label>אחראי ראשי</label>
                        <select name="mainAssignee" value={form.mainAssignee} onChange={handleChange} required>
                            <option value="">בחר</option>
                            {form.assignees.map((user) => (
                                <option key={user} value={user}>{user}</option>
                            ))}
                        </select>
                    </div>
                
                <div>
                    <label>עמותה</label>
                    <select name="organization" value={form.organization} onChange={handleChange} required>
                        <option value="">בחר</option>
                        {associations.map((association) => (
                            <option key={association._id} value={association._id}>{association.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>רמת חשיבות</label>
                    <select name="importance" value={form.importance} onChange={handleChange} required>
                        <option value="">בחר</option>
                        {allImportanceOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt} </option>
                        ))}
                    </select>
                </div>

                {form.importance === "מיידי" &&
                    <div>
                        <label>תת חשיבות</label>
                        <select name="subImportance" value={form.subImportance} onChange={handleChange} required>
                            <option value="">בחר</option>
                            {allSubImportanceOptions.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                }

                <div>
                    <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]} required />
                    <label>תאריך יעד</label>
                </div>
                {form.dueDate &&
                    <div>
                        <input type="date" name="finalDeadline" value={form.finalDeadline} onChange={handleChange}
                            min={form.dueDate} required />
                        <label>תאריך סופי</label>
                    </div>}


                <div>
                    <label htmlFor="project">פרויקט</label>
                    <input
                        id="project"
                        name="project"
                        value={form.project}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <input name="details" value={form.details} onChange={handleChange} />
                    <label>פרטים</label>
                </div>

                <div>
                    <label htmlFor="isRecurring">מחזורית?</label>
                    <input
                        id="isRecurring"
                        type="checkbox"
                        name="isRecurring"
                        checked={form.isRecurring}
                        onChange={handleChange}
                    />
                </div>


                {form.isRecurring && (
                    <div>
                        <div>
                            <label htmlFor="frequencyType">סוג תדירות</label>
                            <select name="frequencyType" value={form.frequencyType} onChange={handleChange} required>
                                <option value="">בחר</option>
                                {frequencyTypeOptions.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                        {form.frequencyType &&
                            <div>
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
                                    <div>
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
                                    <div>

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
                                    <div>
                                        <label>בחר חודש:</label>
                                        <select
                                            value={form.frequencyDetails}
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


                <button type="submit">שמור</button>
            </form>
        </div>
    );
}

export default CreateTask;
