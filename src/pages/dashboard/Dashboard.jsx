import './Dashboard.css';
import React, { useContext, useEffect, useState } from 'react';
import {
  BarChart, PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Bar
} from 'recharts';
import { getPerformance } from '../../services/dashboardService';
import { AuthContext } from '../../context/AuthContext';
import TargetModal from '../../components/targetModal/TargetModal';
import { CheckCheck, TrendingUp } from 'lucide-react';

const COLORS = ['#FF4C4C', '#8B8B8B', '#4C91FF', '#A3C78B', '#C9B59B'];
const STATUS_COLORS = {
  "תאריך": "#FFD700",
  "עקביות": "#9370DB",
  "כללי": "#4C91FF",
  "מגירה": "#8B8B8B",
  "מיידי": "#FF4C4C",
};


const importanceLabels = {
  מיידי: 'מיידי',
  מגירה: 'מגירה',
  תאריך: 'תאריך',
  כללי: 'כללי',
  עקביות: 'עקביות'
};

const timeRanges = ['יום', 'שבוע', 'חודש', 'שנה', 'טווח תאריכים מותאם'];

const Dashboard = ({ employeeId }) => {
  const { user } = useContext(AuthContext);
  const targetEmployeeId = employeeId || user.id;

  const [rangeType, setRangeType] = useState('יום');
  const [data, setData] = useState(null);
  const [progressView, setProgressView] = useState('day');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [animationLoaded, setAnimationLoaded] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const targetViewing = async () => {
    setSelectedEmployee(targetEmployeeId);
  };


  useEffect(() => {
    const requestParams = {};
    const token = user?.token;
    requestParams.employeeId = targetEmployeeId;

    if (rangeType === 'טווח תאריכים מותאם') {
      requestParams.from = fromDate;
      requestParams.to = toDate;
      requestParams.groupBy = progressView;
    }
    else {
      requestParams.rangeType = rangeType;

      if (progressView === 'month') {
        requestParams.groupBy = 'month';
      } else {
        requestParams.groupBy = 'day';
      }
    }

    getPerformance({ ...requestParams, token })
      .then(setData)
      .catch(console.error);
  }, [rangeType, fromDate, toDate, progressView, targetEmployeeId]);


  useEffect(() => {
    if (data) {
      setTimeout(() => {
        setAnimationLoaded(true);
      }, 300);
    }
  }, [data]);


  if (!data)
    return <div>טוען...</div>;

  const goalPercent = data.overallPercentAchieved;
  const completedCount = data.completedCount;

  const safePrevAverage = Math.max(data.prevAverage || 0, 1);
  const diffPercent = ((completedCount - safePrevAverage) / safePrevAverage * 100).toFixed(0);
  const diffSign = diffPercent > 0 ? '+' : '';


  // חישוב נתונים למסילות התקדמות
  const totalTasks = Object.values(data.byImportance || {}).reduce((sum, value) => sum + value, 0);
  const progressBarsData = Object.entries(data.byImportance || {}).map(([key, value]) => ({
    name: importanceLabels[key] || key,
    value,
    percentage: totalTasks > 0 ? Math.round((value / totalTasks) * 100) : 0,
    color: STATUS_COLORS[importanceLabels[key]] || '#ccc'
  }));

  //פאי
  // const pieData = Object.entries(data.byImportance || {}).map(([key, value]) => ({
  //   name: importanceLabels[key] || key,
  //   value
  // }));



  const progressData = data.progress
    .map(item => ({
      date: item.date,
      הושלמו: item.completed
    }))
    .reverse();


  return (
    <div className="dashboard-container">
      <h3 className="dashboard-header">הצג הספקים לפי:</h3>
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
      {rangeType === 'טווח תאריכים מותאם' && (
        <div className="date-range">
          <label>מתאריך:</label>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          <label>עד:</label>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
        </div>


      )}

      <div className="dashboard-sections">
        {/* מסילות התקדמות   */}
        <div className="dashboard-card half-width">
          <h3>פילוח משימות שהושלמו</h3>
          <div>
            <button className="goal-btn" onClick={() => targetViewing()}>
              <TrendingUp size={18} className="goal-icon" />
              צפייה ביעדים אישיים
            </button>
            <div className='check'><CheckCheck size={25} color="#1cd70f" strokeWidth={2.5} />
              <p>מספר משימות שהושלמו: {completedCount}</p>
            </div>
            <div className='check'>
              <span>🎯</span>
              <p>עמידה ביעדים: {goalPercent}% </p>
            </div>
          </div>
          <div className="progress-bars-container">
            {progressBarsData.map((item, index) => (
              <div key={item.name} className="progress-bar-item">
                <div className="progress-bar-label">
                  <span>{item.name}</span>
                  <span>{item.value} משימות</span>
                </div>
                <div className="progress-bar-track">
                  <div
                    className={`progress-bar-fill ${animationLoaded ? 'animated' : ''}`}
                    style={{
                      backgroundColor: item.color,
                      width: animationLoaded ? `${item.percentage}%` : '0%',
                      transitionDelay: `${index * 0.2}s`
                    }}
                    title={`${item.name}: ${item.value} משימות (${item.percentage}%)`}
                  >
                    <span className="progress-bar-percentage">{item.percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>



        {/* פאי פילוח חשיבות */}
        {/* <div className="dashboard-card">
          <h3>פילוח משימות שהושלמו</h3>
          <div>
            <button className="goal-btn" onClick={() => targetViewing()}>
              <TrendingUp size={18} className="goal-icon" />
              צפייה ביעדים אישיים
            </button>
            <div>✅ מספר משימות שהושלמו: {completedCount} </div>
            <div>🎯 עמידה ביעדים: {goalPercent}% </div>
          </div>
          <PieChart width={300} height={300}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}


            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={STATUS_COLORS[entry.name] || '#ccc'} // ברירת מחדל אפור
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>


        </div> */}
        {selectedEmployee && (
          <TargetModal
            employeeId={selectedEmployee}
            onClose={() => setSelectedEmployee(null)}
          />
        )}

        <div className="dashboard-card half-width">
          <h3>השוואה לימי עבודה קודמים</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'ממוצע', ערך: data.prevAverage },
              { name: 'היום', ערך: completedCount }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tick={{ dx: -7 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="ערך" radius={[10, 10, 0, 0]}>
                <Cell fill="#4C91FF" /> {/* ממוצע */}
                <Cell fill="#00C853" /> {/* היום */}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className='presents'>
            {`${diffSign}${diffPercent}%`}
          </div>
        </div>




        {/* גרף התקדמות */}
        <div className="dashboard-card full-width1">
          <h3>גרף התקדמות</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tick={{ dx: -7 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="הושלמו" stroke="#4C91FF" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
          <div className="progress-buttons">
            <button
              className={`progress-button ${progressView === 'day' ? 'primary' : 'secondary'}`}
              onClick={() => setProgressView('day')}
            >
              יומי
            </button>
            <button
              className={`progress-button ${progressView === 'month' ? 'primary' : 'secondary'}`}
              onClick={() => setProgressView('month')}
            >
              חודשי
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
