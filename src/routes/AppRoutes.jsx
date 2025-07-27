import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/login/Login';
import Association from '../pages/association/Association';
import PersonalTasksPage from '../pages/PersonalTasks';
import { AuthContext } from '../context/AuthContext';
import Register from '../pages/register/Register'
import CreateTask from '../components/createTask/CreateTask';

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

      {user.role === 'מנהל' && (
        <>
          <Route path="/association" element={<Association />} />
          <Route path="*" element={<Navigate to="/association" />} />
          <Route path="/register" element={<Register />} />
        </>
      )}

      {user.role === 'עובד' && (
        <>
          <Route path="/mytasks" element={<PersonalTasksPage />} />
          <Route path="*" element={<Navigate to="/mytasks" />} />
        </>
      )}
    </Routes>
  );
};

export default AppRoutes;
