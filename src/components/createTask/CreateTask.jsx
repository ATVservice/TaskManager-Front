import React, { useContext, useEffect, useState } from "react";
import MultiSelect from "../multiSelect/MultiSelect";
import { getUserNames } from '../../services/userService';
import { fetchAllAssociations } from '../../services/associationService';
import { createTask } from '../../services/taskService';
import "./CreateTask.css";
import { AuthContext } from "../../context/AuthContext";
import { fetchGetAllProjectNames } from "../../services/projectService";
import toast from "react-hot-toast";

const CreateTask = ({ onClose, onTaskCreated }) => {
    const { user } = useContext(AuthContext);

    const [associations, setAssociations] = useState([]);
    const allImportanceOptions = ["עקביות", "כללי", "תאריך", "מגירה", "מיידי"];
    const allSubImportanceOptions = ["לפי תאריך", "בהקדם האפשרי", "ממוספר", "דחוף"];
    const frequencyTypeOptions = ["שנתי", "חודשי", "יומי פרטני", "יומי"];
    const [allUsers, setAllUsers] = useState([]);
    const [allProjects, setAllProjects] = useState([]);

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
            days: [],
            month: "",
            day: ""
        },
    });

    useEffect(() => {
        const token = user?.token;

        async function fetchUsers() {
            try {
                const users = await getUserNames(token);
                setAllUsers(users);
            } catch (err) {
                console.error("שגיאה בשליפת משתמשים:", err);
                if (err.response?.status === 401) {
                    toast.error("הגישה נדחתה. אנא התחבר שוב.", { duration: 3000 });

                } else {
                    toast.error(err.response?.data?.message, { duration: 3000 });
                    console.error("שגיאה בלתי צפויה:", err);
                }
            }
        }

        fetchUsers();
    }, []);
    useEffect(() => {
        const token = user?.token;
        const getAssociations = async () => {
            try {
                const data = await fetchAllAssociations(token);
                setAssociations(data);
            } catch (error) {
                toast.error(error.response?.data?.message || 'שגיאה בטעינה', { duration: 3000 });
                console.error('Error fetching associations:', error);
            }
        };

        getAssociations();
    }, []);

    useEffect(() => {
        const loadProjects = async () => {
            const token = user?.token;
            try {
                const projects = await fetchGetAllProjectNames(token);
                setAllProjects(projects);
            } catch (err) {
                toast.error(err.response?.data?.message, { duration: 3000 });
                console.error("שגיאה בשליפת פרויקטים:", err);
            }
        };
        loadProjects();
    }, []);

    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };


    const handleSubmit = async (e) => {
        const token = user?.token;

        e.preventDefault();
        try {

            const preparedForm = {
                ...form,
                assignees: form.assignees.map((u) => u._id),
            };
            console.log("preparedForm", preparedForm);

            if (!preparedForm.project) {
                delete preparedForm.project;
            }
            await createTask(preparedForm, token);
            toast.success("משימה נוצרה בהצלחה", { duration: 2000 });

            onTaskCreated();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'שגיאה ביצירת המשימה', { duration: 3000 });
            console.error('Error adding task:', error);
        }

    };

    return (
        <div className="create-task-container">
            <h4 className="title-h4">צור משימה</h4>
            <form onSubmit={handleSubmit}>
                <div className="form-row">

                    <div className="form-group">
                        <label>כותרת</label>

                        <input name="title" value={form.title} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>פרטים</label>

                        <input name="details" value={form.details} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>פרויקט</label>
                        <select
                            id="project"
                            name="project"
                            value={form.project}
                            onChange={handleChange}

                        >
                            <option value="">בחר פרויקט</option>
                            {allProjects.map((project) => (
                                <option key={project._id} value={project._id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                    </div>

                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>אחראיים</label>
                        <MultiSelect
                            className="select-multiple"
                            required
                            options={allUsers}
                            selected={form.assignees}
                            onChange={(newSelected) =>
                                setForm((prev) => ({ ...prev, assignees: newSelected }))
                            }
                        />
                    </div>
                    <div className="form-group">
                        <label>עמותה</label>
                        <select name="organization" value={form.organization} onChange={handleChange} required>
                            <option value="">בחר</option>
                            {associations.map((association) => (
                                <option key={association._id} value={association._id}>{association.name}</option>
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
                        <select name="mainAssignee" value={form.mainAssignee} onChange={handleChange} required>
                            <option value="">בחר</option>
                            {form.assignees.map((user) => (
                                <option key={user._id} value={user._id}>{user.userName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>רמת חשיבות</label>
                        <select name="importance" value={form.importance} onChange={handleChange} required>
                            <option value="">בחר</option>
                            {allImportanceOptions.map((opt) => (
                                <option key={opt} value={opt}>{opt} </option>
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

                    {form.importance === "מיידי" &&
                        <div className="form-group">
                            <label>תת דירוג</label>
                            <select name="subImportance" value={form.subImportance} onChange={handleChange} required>
                                <option value="">בחר</option>
                                {allSubImportanceOptions.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    }
                </div>
                <div className="form-row">

                    <div className="form-group">
                        <label htmlFor="isRecurring">משימה קבועה?</label>
                        <input
                            id="isRecurring"
                            type="checkbox"
                            name="isRecurring"
                            checked={form.isRecurring}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group"></div>

                </div>

                <div className="form-row">
                    {form.isRecurring && (
                        <div>
                            <div className="form-group">
                                <label htmlFor="frequencyType">סוג תדירות</label>
                                <select name="frequencyType" value={form.frequencyType} onChange={handleChange} required>
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
                        <button type="submit">הוסף</button>
                    </div>

                </div>
            </form>
        </div>
    );
}

export default CreateTask;
