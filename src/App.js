import NavBar from './components/navBar/NavBar';
import AppRoutes from './routes/AppRoutes';
import useSessionManager from './sessionManager.js'
import { Toaster } from 'react-hot-toast';
import { HeadProvider } from 'react-head';
import useSession from './session.js';
import React, { useEffect, useState } from "react";
import useVersionChecker from "./hooks/useVersionChecker";
import UpdateBanner from "./components/UpdateBanner";

const App = () => {
  useSessionManager()
  useSession()
  const updateAvailable = useVersionChecker(180000); // כל 3 דקות
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (updateAvailable) {
      setShowBanner(true);
    }
  }, [updateAvailable]);


  return (
    <>
      {showBanner && <UpdateBanner onRefresh={() => window.location.reload()} />}

      <HeadProvider>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            zIndex: 99999,
          },
        }}
        containerStyle={{
          zIndex: 99999,
          top: 20,
        }}
      />        <NavBar />
        <AppRoutes />
      </HeadProvider>
    </>
  );
};

export default App;
