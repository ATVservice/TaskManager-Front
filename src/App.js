import React from 'react';
import NavBar from './components/navBar/NavBar';
import AppRoutes from './routes/AppRoutes';
import useSessionManager from './sessionManager.js'

const App = () => {
  useSessionManager()

  return (
    <>
      <NavBar />
      <AppRoutes />
    </>
  );
};

export default App;
