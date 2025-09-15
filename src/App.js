import React from 'react';
import NavBar from './components/navBar/NavBar';
import AppRoutes from './routes/AppRoutes';
import useSessionManager from './sessionManager.js'
import { Toaster } from 'react-hot-toast';


const App = () => {
  useSessionManager()

  return (
    <>
      <Toaster  position="top-center" />
      <NavBar />
      <AppRoutes />
    </>
  );
};

export default App;
