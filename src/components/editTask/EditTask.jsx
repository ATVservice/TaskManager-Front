import React, { useContext, useEffect, useState } from "react";
import MultiSelect from "../multiSelect/MultiSelect";
import { getUserNames } from '../../services/userService';
import { fetchAllAssociations } from '../../services/associationService';
import { updateTask } from '../../services/updateService';
import { AuthContext } from "../../context/AuthContext";
import "../createTask/CreateTask.css";
import { fetchGetAllProjectNames } from "../../services/projectService";

const EditTask = ({ onClose, onTaskUpdated, taskToEdit }) => {
  const { user } = useContext(AuthContext);

  const [allUsers, setAllUsers] = useState([]);
  const [associations, setAssociations] = useState([]);
  const [form, setForm] = useState(null);
  const [allProjects, setAllProjects] = useState([]);


  const allImportanceOptions = ["עקביות", "כללי", "תאריך", "מגירה", "מיידי"];
  const allSubImportanceOptions = ["לפי תאריך", "בהקדם האפשרי", "ממוספר", "דחוף"];
  const allStatus = ['בתהליך', 'בטיפול', 'הושלם', 'מושהה', 'בוטלה'];

  useEffect(() => {
    const token = user?.token;
    getUserNames(token).then(setAllUsers).catch(console.error);
    fetchAllAssociations(token).then(setAssociations).catch(console.error);
  }, [user?.token]);

  useEffect(() => {
    const loadProjects = async () => {
      const token = user?.token;
      try {
        const projects = await fetchGetAllProjectNames(token);
        setAllProjects(projects);
      } catch (err) {
        console.error("שגיאה בשליפת פרויקטים:", err);
      }
    };
    loadProjects();
  }, []);

  const formatDate = (d) => {
    if (!d) return "";
    if (typeof d === "string") return d.split("T")[0];
    try { return new Date(d).toISOString().split("T")[0]; } catch { return ""; }
  };

  const normalizeAssignees = (rawAssignees = []) => {
    return rawAssignees
      .map(a => {
        if (!a) return null;
        const id = typeof a === "string" ? a : (a._id || a.id);
        const found = allUsers.find(u => u._id === id);
        return found || (typeof a === "object" ? a : { _id: id, userName: id });
      })
      .filter(Boolean);
  };

  useEffect(() => {
    if (!taskToEdit || allUsers.length === 0) return;

    const normalizedAssignees = normalizeAssignees(taskToEdit.assignees || []);
    const mainAssigneeObj = (() => {
      const m = taskToEdit.mainAssignee;
      if (!m) return null;
      const id = typeof m === "string" ? m : (m._id || m.id);
      return allUsers.find(u => u._id === id) || (typeof m === "object" ? m : { _id: id, userName: id });
    })();

    setForm({
      title: taskToEdit.title || "",
      details: taskToEdit.details || "",
      project: taskToEdit.project || "",
      dueDate: formatDate(taskToEdit.dueDate),
      finalDeadline: formatDate(taskToEdit.finalDeadline),
      importance: taskToEdit.importance || "",
      subImportance: taskToEdit.subImportance ?? undefined,
      assignees: normalizedAssignees,
      mainAssignee: mainAssigneeObj,
      organization: taskToEdit.organization || null,
      status: taskToEdit.status || "",
      isRecurring: !!taskToEdit.isRecurring,
      frequencyType: taskToEdit.frequencyType || "",
      frequencyDetails: taskToEdit.frequencyDetails || {},
    });
  }, [taskToEdit, allUsers]);

  // אם importance שונה שלא "מיידי" - נמחק לחלוטין את שדה ה-subImportance מה-state
  useEffect(() => {
    if (!form) return;
    if (form.importance !== "מיידי" && Object.prototype.hasOwnProperty.call(form, 'subImportance')) {
      setForm(prev => {
        const { subImportance, ...rest } = prev;
        return { ...rest };
      });
    }
  }, [form?.importance]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm(prev => ({ ...prev, [name]: checked }));
      return;
    }

    if (name === "importance") {
      setForm(prev => {
        if (value !== "מיידי") {
          const { subImportance, ...rest } = prev;
          return { ...rest, importance: value };
        }
        return { ...prev, importance: value };
      });
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = user?.token;
    try {
      // קופצים רק אם יש form
      if (!form) throw new Error("אין טופס למלא");

      // יוצאים מ־form את subImportance כדי לא לכלול אותו שלא בצורך
      const { subImportance, ...rest } = form;
      const preparedForm = {
        ...rest,
        assignees: Array.isArray(form.assignees) ? form.assignees.map(a => a._id || a.id || a) : [],
      };

      // במקרה וחשיבות איננה "מיידי" - מוחקים בטוח את השדה מה־payload
      if (form.importance !== "מיידי") {
        if ('subImportance' in preparedForm) delete preparedForm.subImportance;
      } else {
        // אם כן "מיידי" - הוסיפי רק אם יש ערך אמיתי שלא מחרוזת ריקה
        if (typeof subImportance === "string") {
          if (subImportance.trim() !== "") {
            preparedForm.subImportance = subImportance;
          } else {
            // אם ריק — וודאי שלא נשלח
            if ('subImportance' in preparedForm) delete preparedForm.subImportance;
          }
        } else if (subImportance !== undefined) {
          preparedForm.subImportance = subImportance;
        }
      }

      // --- DEBUG: בדקי בקונסול מה הולך להישלח ---
      console.log("Prepared payload for updateTask:", JSON.stringify(preparedForm, null, 2));

      // שליחה לשרת
      await updateTask(taskToEdit._id, preparedForm, token);

      alert("המשימה עודכנה בהצלחה!");
      onTaskUpdated();
      onClose();
    } catch (error) {
      console.error("Update error:", error);
      alert(error.response?.data?.message || "שגיאה בעדכון המשימה");
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
              onChange={(newSelected) => setForm(prev => ({ ...prev, assignees: newSelected }))}
            />
          </div>

          <div className="form-group">
            <label>עמותה</label>
            <select
              name="organization"
              required
              value={form.organization?._id || form.organization || ""}
              onChange={(e) => {
                const selected = associations.find(a => a._id === e.target.value) || null;
                setForm(prev => ({ ...prev, organization: selected }));
              }}
            >
              <option value="">בחר</option>
              {associations.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>תאריך יעד</label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>אחראי ראשי</label>
            <select
              name="mainAssignee"
              required
              value={form.mainAssignee?._id || form.mainAssignee || ""}
              onChange={(e) => {
                const selected = allUsers.find(u => u._id === e.target.value) || null;
                setForm(prev => ({ ...prev, mainAssignee: selected }));
              }}
            >
              <option value="">בחר</option>
              {form.assignees && form.assignees.map(u => (
                <option key={u._id || u.id} value={u._id || u.id}>
                  {u.userName || u.user || u._id || u.id}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>רמת חשיבות</label>
            <select name="importance" value={form.importance || ""} onChange={handleChange} required>
              <option value="">בחר</option>
              {allImportanceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {form.dueDate && (
            <div className="form-group">
              <label>תאריך סופי</label>
              <input
                type="date"
                name="finalDeadline"
                value={form.finalDeadline}
                onChange={handleChange}
                min={form.dueDate}
              />
            </div>
          )}
        </div>

        <div className="form-row">
          {form.importance === "מיידי" && (
            <div className="form-group">
              <label>תת דירוג</label>
              <select
                name="subImportance"
                value={form.subImportance || ""}
                onChange={handleChange}
                required
              >
                <option value="">בחר</option>
                {allSubImportanceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>סטטוס</label>
            <select name="status" value={form.status || ""} onChange={handleChange} required>
              <option value="">בחר</option>
              {allStatus.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <button type="submit">עדכן</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditTask;
