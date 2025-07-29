import React, { createContext, useState, useEffect } from 'react';

export const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    keyword: '',
    importance: '',
    subImportance: '',
    status: '',
    assigneeType: '',
    selectedAssignee: '',
    organization: '',
    dateFrom: '',
    dateTo: ''
  });

  // טען סינון מ-localStorage כשהרכיב נטען
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const savedFiltersStr = localStorage.getItem(`taskFilters_${user.id}`);
    if (savedFiltersStr) {
      try {
        const savedFilters = JSON.parse(savedFiltersStr);
        setFilters(savedFilters);
      } catch {
        // במקרה של שגיאה ב-parsing, אפשר לנקות או להתעלם
      }
    }
  }, []);

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
