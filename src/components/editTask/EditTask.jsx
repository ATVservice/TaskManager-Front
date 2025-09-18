import React, { useContext, useEffect, useState } from "react";
import MultiSelect from "../multiSelect/MultiSelect";
import { getUserNames } from '../../services/userService';
import { fetchAllAssociations } from '../../services/associationService';
import { updateRecurringTask, updateTask } from '../../services/updateService';
import { AuthContext } from "../../context/AuthContext";
import "../createTask/CreateTask.css";
import { fetchGetAllProjectNames } from "../../services/projectService";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

const EditTask = ({ onClose, onTaskUpdated, taskToEdit, taskType }) => {
  const { user } = useContext(AuthContext);
  const [allUsers, setAllUsers] = useState([]);
  const [associations, setAssociations] = useState([]);
  const [form, setForm] = useState(null);
  const [allProjects, setAllProjects] = useState([]);

  const allImportanceOptions = ["עקביות", "כללי", "תאריך", "מגירה", "מיידי"];
  const allSubImportanceOptions = ["לפי תאריך", "בהקדם האפשרי", "ממוספר", "דחוף"];
  const allStatus = ['לביצוע', 'בטיפול', 'הושלם', 'בוטלה'];

  function removeUnchangedFields(preparedForm, originalTask) {
    const cleaned = { ...preparedForm };
    for (const key in preparedForm) {
      const newVal = preparedForm[key];
      const oldVal = originalTask[key];

      if (JSON.stringify(newVal) === JSON.stringify(oldVal)) {
        delete cleaned[key];
      }
    }
    return cleaned;
  }

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
        toast.error(err.response?.data?.message, { duration: 3000 });
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
      project: taskToEdit.project && typeof taskToEdit.project === "object"
        ? taskToEdit.project._id
        : taskToEdit.project || null,

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
  const handleDateChange = async (e) => {
    const { name, value } = e.target;

    if ((name === "dueDate" || name === "finalDeadline") && value !== form[name]) {
      // בדיקה אם התאריך נדחה (התאריך החדש מאוחר יותר)
      const currentDate = form[name] ? new Date(form[name]) : null;
      const newDate = new Date(value);
      const isDelayed = currentDate && newDate > currentDate;

      // הצג את החלון רק אם התאריך נדחה
      if (isDelayed) {
        const { value: result, isConfirmed } = await Swal.fire({
          title: 'סיבת דחיית התאריך (לא חובה)',
          html: `
            <select id="reasonSelect" class="swal2-input">
              <option value="">ללא סיבה</option>
              <option value="חוסר זמן">חוסר זמן</option>
              <option value="חופשה">חופשה</option>
              <option value="בעיה טכנית">בעיה טכנית</option>
              <option value="תלות בגורם חיצוני">תלות בגורם חיצוני</option>
              <option value="לא דחוף">לא דחוף</option>
              <option value="אחר">אחר</option>
            </select>
            <input id="customReason" class="swal2-input" placeholder="פירוט..." style="display:none" />
          `,
          focusConfirm: false,
          preConfirm: () => {
            const reason = document.getElementById('reasonSelect').value;
            const custom = document.getElementById('customReason').value;

            // רק אם בחר "אחר" ולא מילא פירוט - תן התראה
            if (reason === "אחר" && !custom.trim()) {
              Swal.showValidationMessage('אנא מלא פירוט כאשר בוחר "אחר"');
              return false;
            }

            return reason ? { option: reason, customText: custom } : null;
          },
          didOpen: () => {
            const select = document.getElementById('reasonSelect');
            const customInput = document.getElementById('customReason');
            select.addEventListener('change', (e) => {
              if (e.target.value === "אחר") {
                customInput.style.display = "block";
              } else {
                customInput.style.display = "none";
              }
            });
          },
          showCancelButton: true,
          confirmButtonText: 'אישור',
          cancelButtonText: 'ביטול',
          target: document.body, 
          backdrop: true,
          zIndex: 99999 
        });



        setForm(prev => ({
          ...prev,
          [name]: value,
          failureReason: result || undefined // שמור רק אם יש סיבה
        }));
      } else {
        // אם התאריך לא נדחה, פשוט עדכן ללא סיבה
        setForm(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = user?.token;
    try {
      if (!form) throw new Error("אין טופס למלא");

      const preparedForm = {};

      if (!form.project) {
        delete preparedForm.project;
      }

      if (form.failureReason) {
        const fr = form.failureReason;
        if (fr.option === "אחר") {
          preparedForm.failureReason = fr.customText; // רק הטקסט החופשי
        } else {
          preparedForm.failureReason = fr.option;    // אחד מהאופציות הקבועות
        }
      }

      const formatDateStr = (d) => d ? new Date(d).toISOString().split("T")[0] : null;

      const isEqual = (a, b) => {
        if (Array.isArray(a) && Array.isArray(b)) {
          const aIds = a.map(x => x._id || x.id || x);
          const bIds = b.map(x => x._id || x.id || x);
          return JSON.stringify(aIds) === JSON.stringify(bIds);
        }
        if (typeof a === "object" && typeof b === "object") {
          return JSON.stringify(a || {}) === JSON.stringify(b || {});
        }
        return a === b;
      };

      for (const key in form) {
        let value = form[key];
        let original = taskToEdit[key];

        if (key === "isRecurring") continue;

        if (["frequencyType", "frequencyDetails"].includes(key)) {
          const isTaskRecurring = taskToEdit.frequencyType || taskToEdit.frequencyDetails;
          if (!isTaskRecurring) continue;
          if (!isEqual(value, original)) preparedForm[key] = value;
          continue;
        }

        // המרה לתאריכים
        if (key === "dueDate" || key === "finalDeadline") {
          if (formatDateStr(value) !== formatDateStr(original)) preparedForm[key] = value;
          continue;
        }

        // מערכים של אובייקטים
        if (key === "assignees") {
          const ids = value.map(a => a._id || a.id || a);
          const origIds = (original || []).map(a => a._id || a.id || a);
          if (!isEqual(ids, origIds)) preparedForm.assignees = ids;
          continue;
        }

        if (key === "mainAssignee") {
          const id = value?._id || value?.id || value;
          const origId = original?._id || original?.id || original;
          if (!isEqual(id, origId)) preparedForm.mainAssignee = id;
          continue;
        }

        // אובייקטים nested
        if (key === "frequencyDetails") {
          if (!isEqual(value, original)) preparedForm[key] = value;
          continue;
        }

        // קבועות
        if (["isRecurring", "frequencyType"].includes(key)) {
          if (!isEqual(value, original)) preparedForm[key] = value;
          continue;
        }

        // תת חשיבות
        if (key === "subImportance") {
          if (form.importance === "מיידי" && value && value.trim() !== "" && !isEqual(value, original)) {
            preparedForm.subImportance = value;
          }
          continue;
        }

        // שדות רגילים
        if (!isEqual(value, original)) preparedForm[key] = value;
      }

      console.log("Prepared payload for updateTask:", preparedForm);

      if (taskType === "recurring") {
        await updateRecurringTask(taskToEdit._id, preparedForm, token);
      } else {
        await updateTask(taskToEdit._id, preparedForm, token);
      }

      toast.success("המשימה עודכנה בהצלחה", { duration: 2000 });
      onTaskUpdated();
      onClose();

    } catch (error) {
      toast.error(error.response?.data?.message || "לא ניתן לערוך משימה כרגע", { duration: 3000 });
      console.error("Update error:", error);
    }
  };

  if (!form) return <div>טוען...</div>;

  return (
    <div className="create-task-container">
      <h4 className="title-h4">עריכת משימה</h4>
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
              value={form?.project || ""}
              onChange={(e) => {
                const val = e.target.value;
                setForm(prev => ({
                  ...prev,
                  project: val === "" || val === "בחר פרויקט" ? null : val
                }));
              }}
            >
              <option>בחר פרויקט</option>
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

          {(taskType === "single") && (
            <>
              <div className="form-group">
                <label>תאריך משימה</label>
                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  // onChange={handleChange}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </>
          )}

          {(taskType === "recurring") && (
            <div className="form-group">
              <label htmlFor="frequencyType">סוג תדירות</label>
              <select
                name="frequencyType"
                value={form.frequencyType || ""}
                onChange={handleChange}
                required
              >
                <option value="">בחר</option>
                <option value="שנתי">שנתי</option>
                <option value="חודשי">חודשי</option>
                <option value="יומי פרטני">יומי פרטני</option>
                <option value="יומי">יומי</option>
              </select>
            </div>
          )}
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
                onChange={handleDateChange}
                // onChange={handleChange}
                min={form.dueDate} />
            </div>

          )}
          {form.frequencyType && (
            <div className="form-group">
              <label>פרטי תדירות</label>

              {form.frequencyType === "יומי" && (
                <label>
                  כולל ימי שישי?
                  <input
                    type="checkbox"
                    checked={form.frequencyDetails?.includingFriday || false}
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

              {(taskType === "recurring") && form.frequencyType === "יומי פרטני" && (
                <div className="form-group">
                  <label>בחר ימים:</label>
                  {[
                    { label: "ראשון", value: 0 },
                    { label: "שני", value: 1 },
                    { label: "שלישי", value: 2 },
                    { label: "רביעי", value: 3 },
                    { label: "חמישי", value: 4 },
                    { label: "שישי", value: 5 }
                  ].map((day) => (
                    <label key={day.value} style={{ marginInlineEnd: '8px' }}>
                      <input
                        type="checkbox"
                        checked={form.frequencyDetails?.days?.includes(day.value) || false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setForm((prev) => {
                            const prevDays = prev.frequencyDetails?.days || [];
                            const newDays = checked
                              ? [...prevDays, day.value]
                              : prevDays.filter((v) => v !== day.value);
                            return {
                              ...prev,
                              frequencyDetails: { ...prev.frequencyDetails, days: newDays },
                            };
                          });
                        }}
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
              )}

              {form.frequencyType === "חודשי" && (
                <select
                  value={form.frequencyDetails?.dayOfMonth || ""}
                  onChange={(e) =>
                    setForm(prev => ({
                      ...prev,
                      frequencyDetails: {
                        ...prev.frequencyDetails,
                        dayOfMonth: Number(e.target.value),
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
              )}

              {form.frequencyType === "שנתי" && (
                <div className="form-group">
                  <select
                    value={form.frequencyDetails?.month || ""}
                    onChange={(e) =>
                      setForm(prev => ({
                        ...prev,
                        frequencyDetails: {
                          ...prev.frequencyDetails,
                          month: Number(e.target.value),
                        },
                      }))
                    }
                  >
                    <option value="">--בחר חודש--</option>
                    {[
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
                    ].map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={form.frequencyDetails?.day || ""}
                    onChange={(e) =>
                      setForm(prev => ({
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
          )}

        </div>

        <div className="form-row">

          {(taskType === "single") && (
            <>
              <div className="form-group">
                <label>סטטוס</label>
                <select name="status" value={form.status || ""} onChange={handleChange} required>
                  <option value="">בחר</option>
                  {allStatus.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </>
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
