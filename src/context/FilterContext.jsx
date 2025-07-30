import React, { createContext, useState, useEffect } from 'react';

export const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const getInitialFilters = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return defaultFilters;
    
    const user = JSON.parse(userStr);
    const saved = localStorage.getItem(`taskFilters_${user.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultFilters;
      }
    }
    return defaultFilters;
  };
  
  const defaultFilters = {
    keyword: '',
    importance: '',
    subImportance: '',
    status: '',
    assigneeType: '',
    selectedAssignee: '',
    organization: '',
    dateFrom: '',
    dateTo: ''
  };
  

  const [filters, setFilters] = useState(getInitialFilters);

  // שמור סינון ל-localStorage בכל פעם שמשתנה
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    localStorage.setItem(`taskFilters_${user.id}`, JSON.stringify(filters));
  }, [filters]);


  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FilterContext.Provider>
  );
};
