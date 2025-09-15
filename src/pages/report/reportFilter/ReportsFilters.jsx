import React, { useContext, useState } from "react";
import "./ReportsFilters.css";
import { AuthContext } from "../../../context/AuthContext";
import { fetchResetFilter } from "../../../services/reportFiltersService";

const ReportsFilters = ({ filters, setFilters, employees, associations, reasons, reportType }) => {
  const { user } = useContext(AuthContext);
  const [isResetting, setIsResetting] = useState(false);

  const statusOptions = [
    { value: "", label: "הכל" },
    { value: "לביצוע", label: "לביצוע" },
    { value: "בטיפול", label: "בטיפול" },
    { value: "הושלם", label: "הושלם" },
    { value: "בוטלה", label: "בוטלה" },
  ];

  const importanceOptions = [
    { value: "", label: "הכל" },
    { value: "עקביות", label: "עקביות" },
    { value: "כללי", label: "כללי" },
    { value: "תאריך", label: "תאריך" },
    { value: "מגירה", label: "מגירה" },
    { value: "מיידי", label: "מיידי" },
  ];

  const subImportanceOptions = [
    { value: "", label: "הכל" },
    { value: "לפי תאריך", label: "לפי תאריך" },
    { value: "בהקדם האפשרי", label: "בהקדם האפשרי" },
    { value: "ממוספר", label: "ממוספר" },
    { value: "דחוף", label: "דחוף" },
  ];

  const getScreenTypeByReportType = (reportType) => {
    const mapping = {
      openTasksByEmployee: "openTasks",
      tasksByResponsibility: "tasksByResponsibility",
      overdueTasks: "overdueTasks",
      tasksSummaryByPeriod: "tasksByPeriod",
      employeePersonalStats: "employeeStats",
    };
    return mapping[reportType] || "general";
  };

  const resetFilter = async () => {
    setIsResetting(true);
    try {
      const screenType = getScreenTypeByReportType(reportType);
      const result = await fetchResetFilter(screenType, user?.token);

      if (result.success) {
        setFilters({
          employeeId: "",
          associationId: "",
          status: "",
          startDate: "",
          endDate: "",
          importance: "",
          subImportance: "",
          reasonId: "",
        });
      }
    } catch (error) {
      console.error("שגיאה באיפוס פילטר:", error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="reports-filters">
      <div className="header">
        <h3>סינון לפי:</h3>
        <a onClick={() => resetFilter()} className="reset-link" > איפוס סינון </a>
      </div>

      {/* עובד */}
      <div className="filter-group">
        <label>עובד</label>
        <select
          value={filters.employeeId || ""}
          onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
        >
          <option value="">הכל</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.userName} ({emp.firstName} {emp.lastName})
            </option>
          ))}
        </select>
      </div>

      {/* עמותה */}
      <div className="filter-group">
        <label>עמותה</label>
        <select
          value={filters.associationId || ""}
          onChange={(e) => setFilters({ ...filters, associationId: e.target.value })}
        >
          <option value="">הכל</option>
          {associations.map((asso) => (
            <option key={asso._id} value={asso._id}>
              {asso.name}
            </option>
          ))}
        </select>
      </div>

      {/* סטטוס */}
      <div className="filter-group">
        <label>סטטוס</label>
        <select
          value={filters.status || ""}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* טווח תאריכים */}
      <div className="filter-group">
        <label>מתאריך</label>
        <input
          type="date"
          value={filters.startDate || ""}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        />
      </div>

      <div className="filter-group">
        <label>עד תאריך</label>
        <input
          type="date"
          value={filters.endDate || ""}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />
      </div>

      {/* חשיבות */}
      <div className="filter-group">
        <label>חשיבות</label>
        <select
          value={filters.importance || ""}
          onChange={(e) => setFilters({ ...filters, importance: e.target.value })}
        >
          {importanceOptions.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* תת חשיבות */}
      {filters.importance === "מיידי" && (
        <div className="filter-group">
          <label>תת חשיבות</label>
          <select
            value={filters.subImportance || ""}
            onChange={(e) => setFilters({ ...filters, subImportance: e.target.value })}
          >
            {subImportanceOptions.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      )}
   {/* סיבת אי־ביצוע */}
   <div className="filter-group">
        <label>סיבת אי־ביצוע</label>
        <select
          value={filters.reasonId || ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              reasonId: e.target.value,
              reasonText: "",
            })
          }
        >
          <option value="">הכל</option>
          {reasons.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
          <option value="other">אחר...</option>
        </select>

        {filters.reasonId === "other" && (
          <input
            type="text"
            placeholder="נא לציין סיבה"
            value={filters.reasonText || ""}
            onChange={(e) => setFilters({ ...filters, reasonText: e.target.value })}
          />
        )}
      </div>
    </div>
  );
};

export default ReportsFilters;
