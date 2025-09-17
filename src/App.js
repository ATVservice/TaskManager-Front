import React from 'react';
import NavBar from './components/navBar/NavBar';
import AppRoutes from './routes/AppRoutes';
import useSessionManager from './sessionManager.js'
import { Toaster } from 'react-hot-toast';
import { HeadProvider } from 'react-head';  



const App = () => {
  useSessionManager()

  return (

    <HeadProvider>
      <Toaster position="top-center" />
      <NavBar />
      <AppRoutes />
    </HeadProvider>

  );
};

export default App;
