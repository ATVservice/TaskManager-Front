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

const AppRoutes = () => {
  const { user } = useContext(AuthContext);
  console.log(user);

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/createTask" element={<CreateTask />} />
      <Route path='/tasks' element={<Tasks />} />
      <Route path='/recyclingBin' element={<RecyclingBin />} />
      <Route path="/history/:taskId" element={<History />} />



      {user.role === 'מנהל' && (
        <>
          <Route path="/association" element={<Association />} />
          <Route path="*" element={<Navigate to="/association" />} />
          <Route path="/register" element={<Register />} />
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
