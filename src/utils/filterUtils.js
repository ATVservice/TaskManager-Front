// פונקציה פשוטה שמחפשת לפי טקסט
export const applyFilters = (data, filters) => {
    let result = [...data];
  
    if (filters.search && filters.search.trim() !== "") {
      const searchText = filters.search.toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchText)
        )
      );
    }
  
    return result;
  };
  