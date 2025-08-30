import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/login/Login';
import Tasks from '../pages/tasks/Tasks';
import Association from '../pages/association/Association';
import { AuthContext } from '../context/AuthContext';
import Register from '../pages/register/Register'
import CreateTask from '../components/createTask/CreateTask';
import RecyclingBin from '../pages/recyclingBin/RecyclingBin';
import Dashboard from '../pages/dashboard/Dashboard'
import History from '../pages/history/History';
import GoalForm from '../components/goalForm/GoalForm';
import ResetPassword from '../pages/resetPassword/ResetPassword';
import EmployeeManagement from '../pages/employeeManagement/EmployeeManagement';
import AdminDashboard from '../pages/adminDashboard/AdminDashboard';
import Report from '../pages/report/report/Report'

const AppRoutes = () => {
  const { user } = useContext(AuthContext);
  console.log(user);


  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/createTask" element={<CreateTask />} />
      <Route path='/tasks' element={<Tasks />} />
      <Route path='/recyclingBin' element={<RecyclingBin />} />
      <Route path="/history/:taskId" element={<History />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />


      {user.role === 'מנהל' && (
        <>
          <Route path="/association" element={<Association />} />
          <Route path="*" element={<Navigate to="/tasks" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/goals" element={<GoalForm />} />
          <Route path="/employee" element={<EmployeeManagement />} />
          <Route path="/adminDashboard" element={<AdminDashboard />} />
          <Route path="/reports" element={<Report />} />




        </>
      )}

      {user.role === 'עובד' && (
        <>
          <Route path="*" element={<Navigate to="/tasks" />} />
          <Route path="/dashboard" element={<Dashboard />} />

        </>
      )}
    </Routes>
  );
};

export default AppRoutes;
