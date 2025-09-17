import React from 'react';
import NavBar from './components/navBar/NavBar';
import AppRoutes from './routes/AppRoutes';
import useSessionManager from './sessionManager.js'
import { Toaster } from 'react-hot-toast';
import { HeadProvider } from 'react-head';  
import useSession from './session.js';



const App = () => {
  useSessionManager()
  useSession()


  return (

    <HeadProvider>
      <Toaster position="top-center" />
      <NavBar />
      <AppRoutes />
    </HeadProvider>

  );
};

export default App;
