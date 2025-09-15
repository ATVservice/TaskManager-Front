export const saveUserFilter = (userId, screenType, filters) => {
    const key = `${userId}_${screenType}`;
    localStorage.setItem(key, JSON.stringify(filters));
  };
  
  export const loadUserFilter = (userId, screenType) => {
    const key = `${userId}_${screenType}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : {};
  };
  
  export const resetUserFilter = (userId, screenType) => {
    const key = `${userId}_${screenType}`;
    localStorage.removeItem(key);
  };
  