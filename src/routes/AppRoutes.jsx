import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AnimatePresence } from "framer-motion";
import PageWrapper from "../components/PageWrapper";

import Login from '../pages/login/Login';
import Tasks from '../pages/tasks/Tasks';
import Association from '../pages/association/Association';
import Register from '../pages/register/Register';
import CreateTask from '../components/createTask/CreateTask';
import RecyclingBin from '../pages/recyclingBin/RecyclingBin';
import Dashboard from '../pages/dashboard/Dashboard';
import History from '../pages/history/History';
import GoalForm from '../components/goalForm/GoalForm';
import ResetPassword from '../pages/resetPassword/ResetPassword';
import EmployeeManagement from '../pages/employeeManagement/EmployeeManagement';
import AdminDashboard from '../pages/adminDashboard/AdminDashboard';
import Report from '../pages/report/report/Report';
import AlertsPage from '../pages/alertsPage/AlertsPage';

const AppRoutes = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {!user ? (
          <>
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="*" element={<PageWrapper><Navigate to="/login" replace /></PageWrapper>} />
            <Route path="/reset-password/:token" element={<PageWrapper><ResetPassword /></PageWrapper>} />
          </>
        ) : (
          <>
            <Route path="*" element={<PageWrapper><Navigate to="/login" replace /></PageWrapper>} />
            <Route path="/createTask" element={<PageWrapper><CreateTask /></PageWrapper>} />
            <Route path='/tasks' element={<PageWrapper><Tasks /></PageWrapper>} />
            <Route path='/recyclingBin' element={<PageWrapper><RecyclingBin /></PageWrapper>} />
            <Route path="/history/:taskId/:model" element={<PageWrapper><History /></PageWrapper>} />
            <Route path="/reset-password/:token" element={<PageWrapper><ResetPassword /></PageWrapper>} />
            <Route path="/allAlerts" element={<PageWrapper><AlertsPage /></PageWrapper>} />



            {user.role === 'מנהל' && (
              <>
                <Route path="/association" element={<PageWrapper><Association /></PageWrapper>} />
                <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
                <Route path="/goals" element={<PageWrapper><GoalForm /></PageWrapper>} />
                <Route path="/employee" element={<PageWrapper><EmployeeManagement /></PageWrapper>} />
                <Route path="/adminDashboard" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
                <Route path="/reports" element={<PageWrapper><Report /></PageWrapper>} />
              </>
            )}

            {user.role === 'עובד' && (
              <>
                <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
              </>
            )}
            <Route path="*" element={<PageWrapper><Navigate to="/login" replace /></PageWrapper>} />

          </>
        )}
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
