import './AdminDashboard.css';
import React, { useContext, useEffect, useState } from 'react';
import {
  Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { AuthContext } from '../../context/AuthContext';
import { fetchGeneralSummary } from '../../services/adminDashboard';
import { BarChart3, X } from 'lucide-react';
import Dashboard from '../dashboard/Dashboard';
import { getNames } from '../../services/userService';
import Select from "react-select";
import toast from 'react-hot-toast';
import { Title } from 'react-head';

const STATUS_COLORS = {
  "תאריך": "#FFD700",
  "עקביות": "#9370DB",
  "כללי": "#4C91FF",
  "מגירה": "#8B8B8B",
  "מיידי": "#FF4C4C",
};

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);

  //סינונים
  const [rangeType, setRangeType] = useState('חודש');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);

  const timeRanges = ['יום', 'שבוע', 'חודש', 'שנה', 'טווח תאריכים מותאם'];

  const getFilterType = (hebrewRange) => {
    const mapping = {
      'יום': 'day',
      'שבוע': 'week',
      'חודש': 'month',
      'שנה': 'year',
      'טווח תאריכים מותאם': 'custom'
    };
    return mapping[hebrewRange] || 'month';
  };

  const loadSummaryData = async () => {
    if (!user?.token) return;

    setLoading(true);
    try {
      const filterOptions = {
        filterType: getFilterType(rangeType)
      };

      if (rangeType === 'טווח תאריכים מותאם') {
        filterOptions.startDate = fromDate;
        filterOptions.endDate = toDate;
      }
      const result = await fetchGeneralSummary(user.token, filterOptions);
      setData(result);
    } catch (error) {
      toast.error(error.response?.data?.message || 'שגיאה בטעינה', { duration: 3000 });
      console.error('שגיאה בטעינת נתונים:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.token) return;

    const loadNames = async () => {
      try {
        const names = await getNames(user.token);
        const unique = new Map();

        names.forEach((n) => {
          const key = `${n.firstName} ${n.lastName}`;
          if (!unique.has(key)) {
            unique.set(key, { value: n.firstName, label: key });
          }
        });

        setEmployees([...unique.values()]);
      } catch (error) {
        console.error("שגיאה בטעינת שמות:", error);
        toast.error("שגיאה בטעינה", { duration: 3000 });
      }
    };

    loadNames();
  }, [user]);


  // טעינת נתונים כשמשתנה הסינון
  useEffect(() => {
    // אם זה טווח מותאם, מחכה שיבחרו תאריכים
    if (rangeType === 'טווח תאריכים מותאם' && (!fromDate || !toDate)) {
      return;
    }

    loadSummaryData();
  }, [rangeType, fromDate, toDate, user]);

  if (loading) return <div>טוען נתונים...</div>;
  if (!data) return <div>אין נתונים להצגה</div>;


  const barData = [
    { name: 'חודש קודם', ערך: data.comparison.previous },
    { name: 'חודש נוכחי', ערך: data.comparison.current }
  ];

  return (
    <>
      <Title>דשבורד</Title>

      <div className="admin-dashboard">

        <div className="dashboard-sections">

          <div className="admin-dashboard-card">
            <h3>פילוח לפי חשיבות</h3>
            <div className="filter-section">
              <div className="range-buttons">
                {timeRanges.map(r => (
                  <button
                    key={r}
                    onClick={() => setRangeType(r)}
                    className={`range-button ${r === rangeType ? 'active' : ''}`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* בחירת תאריכים אם זה טווח מותאם */}
              {rangeType === 'טווח תאריכים מותאם' && (
                <div className="date-range">
                  <label>מתאריך:</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                  />
                  <label>עד:</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={e => setToDate(e.target.value)}
                  />
                </div>
              )}
            </div>
            <p><strong>סך הכל משימות שהושלמו:</strong> {data.totalCompletedFiltered}</p>

            <div className="progress-bars-container">
              {data.tasksByImportance.map((item, idx) => {
                const total = data.totalCompletedFiltered || 1;
                const percentage = Math.round((item.count / total) * 100);
                const color = STATUS_COLORS[item._id] || '#ccc';
                return (
                  <div key={item._id} className="progress-bar-item">
                    <div className="progress-bar-label">
                      <span>{item._id}</span>
                      <span>{item.count} משימות</span>
                    </div>
                    <div className="progress-bar-track">
                      <div
                        key={`${item._id}-${percentage}`}
                        className="progress-bar-fill"
                        style={{ width: `${percentage}%`, backgroundColor: color }}
                      >
                        <span className="progress-bar-percentage">{percentage}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="admin-dashboard-card">
            <h3>השוואת משימות</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tick={{ dx: -7 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="ערך"
                  radius={[10, 10, 0, 0]}
                  barSize={130}
                >
                  <Cell fill="#4C91FF" />
                  <Cell fill="#00C853" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="comparison-text">
              {data.comparison.changePercent.toFixed(1)}%
            </p>
          </div>

          <div className="admin-dashboard-card full-width">
            <h3>ביצועי עובדים</h3>
            <p><strong> עמידה ביעדים אישים:</strong>  % {data.overallGeneralGoals} | <strong>עמידה ביעדים כלליים: </strong> % {data.overallPersonalGoals}</p>

            <p>  </p>
            <Select
              options={employees}
              value={selectedEmp}
              onChange={setSelectedEmp}
              isClearable
              placeholder="בחר עובד..."
              noOptionsMessage={() => "לא נמצאו תוצאות"}
            />

            <table className="employee-table">
              <thead>
                <tr>
                  <th>שם משתמש</th>
                  <th>שם</th>
                  <th>עמידה ביעדים</th>
                  <th>דירוג</th>
                  <th>פירוט</th>
                </tr>
              </thead>
              <tbody>
                {data.employeeRatings
                  .filter(emp => !selectedEmp || emp.employeeName.includes(selectedEmp.label))
                  .map((emp, idx) => (
                    <tr key={idx}>
                      <td>{emp.employeeUserName}</td>
                      <td>{emp.employeeName}</td>
                      <td>
                        {emp.percent !== null ? (
                          <div>
                            <div className="progress-bar">
                              <div
                                className="progress-bar-fill"
                                style={{ width: `${emp.percent}%` }}
                              />
                            </div>
                            <span style={{ fontSize: "12px", color: "#666" }}>
                              {emp.percent}%
                            </span>
                          </div>
                        ) : "-"}
                      </td>
                      <td className={`status ${emp.rating.replace(/\s/g, '')}`}>
                        {emp.rating}
                      </td>
                      <td>
                        <button
                          className="icon-btn"
                          onClick={() => setSelectedEmployee(emp)}
                          title="צפה בדשבורד העובד"
                        >
                          <BarChart3 className='barChart' size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {selectedEmployee && (
            <div className="employee-dashboard-modal">
              <div className="modal-header">
                <h3>דשבורד – {selectedEmployee.employeeName}</h3>
                <button onClick={() => setSelectedEmployee(null)} className="icon-btn">
                  <X size={20} />
                </button>
              </div>
              <Dashboard employeeId={selectedEmployee.employeeId} />
            </div>
          )}
        </div>
      </div>
      </>
      );
};

      export default AdminDashboard;
