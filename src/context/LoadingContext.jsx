import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";
import Loader from "../components/loader/Loader";
import { setLoadingHandlers } from "../services/loadingService";

const LoadingContext = createContext();
export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children, showDelay = 120, minShow = 300 }) => {
  const [isLoading, setIsLoading] = useState(false);
  const countRef = useRef(0);
  const showTimerRef = useRef(null);
  const startTimeRef = useRef(0);

  const showLoading = useCallback(() => {
    countRef.current += 1;
    if (countRef.current === 1) {
      showTimerRef.current = setTimeout(() => {
        startTimeRef.current = Date.now();
        setIsLoading(true);
        showTimerRef.current = null;
      }, showDelay);
    }
  }, [showDelay]);

  const hideLoading = useCallback(() => {
    if (countRef.current <= 0) return;
    countRef.current = Math.max(0, countRef.current - 1);

    if (countRef.current === 0) {
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
        return;
      }
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, minShow - elapsed);
      setTimeout(() => {
        if (countRef.current === 0) setIsLoading(false);
      }, remaining);
    }
  }, [minShow]);

  useEffect(() => {
    setLoadingHandlers(showLoading, hideLoading);
    return () => setLoadingHandlers(()=>{}, ()=>{});
  }, [showLoading, hideLoading]);

  const value = { isLoading, showLoading, hideLoading };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && <Loader />}
    </LoadingContext.Provider>
  );
};
