import './Dashboard.css';
import React, { useContext, useEffect, useState } from 'react';
import {
  BarChart, PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Bar
} from 'recharts';
import { getPerformance } from '../../services/dashboardService';
import { AuthContext } from '../../context/AuthContext';

const COLORS = ['#FF4C4C', '#8B8B8B', '#4C91FF', '#A3C78B', '#C9B59B'];

const importanceLabels = {
  מיידי: 'מיידי',
  מגירה: 'מגירה',
  תאריך: 'תאריך',
  כללי: 'כללי',
  עקביות: 'עקביות'
};

const timeRanges = ['יום', 'שבוע', 'חודש', 'שנה', 'טווח תאריכים מותאם'];

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const [rangeType, setRangeType] = useState('יום');
  const [data, setData] = useState(null);
  const [progressView, setProgressView] = useState('day');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');





  useEffect(() => {
    const requestParams = {};
    const token = user?.token;
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
  }, [rangeType, fromDate, toDate, progressView]);
  console.log("data", data)


  if (!data) return <div>טוען...</div>;
  const goalPercent = data.overallPercentAchieved;
  const completedCount = data.completedCount;

  const safePrevAverage = Math.max(data.prevAverage || 0, 1);
  const diffPercent = ((completedCount - safePrevAverage) / safePrevAverage * 100).toFixed(0);
  const diffSign = diffPercent > 0 ? '+' : '';

  const pieData = Object.entries(data.byImportance || {}).map(([key, value]) => ({
    name: importanceLabels[key] || key,
    value
  }));



  const progressData = data.progress
    .map(item => ({
      date: item.date,
      completed: item.completed
    }))


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
        <div>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
        </div>
      )}

      <div className="dashboard-sections">



        {/* פאי פילוח חשיבות */}
        <div className="dashboard-card">
          <h3>פילוח משימות שהושלמו</h3>
          <div>
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
              label={({ name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
           
              
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />

              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        <div className="dashboard-card">
          <h3>השוואה לימי עבודה קודמים</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'ממוצע', value: data.prevAverage },
              { name: 'היום', value: completedCount }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                <Cell fill="#4C91FF" /> {/* ממוצע */}
                <Cell fill="#00C853" /> {/* היום */}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ textAlign: 'center', color: 'green', fontWeight: 'bold', marginLeft: '60%' }}>
            {`${diffSign}${diffPercent}%`}
          </div>
        </div>




        {/* גרף התקדמות */}
        <div className="dashboard-card">
          <h3>גרף התקדמות</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="completed" stroke="#4C91FF" strokeWidth={3} />
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
