import {
    getOpenTasksByEmployee,
    getTasksByResponsibility,
    getOverdueTasks,
    getTasksSummaryByPeriod,
    getEmployeePersonalStats,
    getTasksByFailureReason
  } from"./reportService.js"
  
  export const fetchReportData = async (reportType, token, filters) => {
    switch (reportType) {
      case "openTasksByEmployee":
        return await getOpenTasksByEmployee(token, filters);
      case "tasksByResponsibility":
        return await getTasksByResponsibility(token, filters);
      case "overdueTasks":
        return await getOverdueTasks(token, filters);
      case "tasksSummaryByPeriod":
        return await getTasksSummaryByPeriod(token, filters);
      case "employeePersonalStats":
        return await getEmployeePersonalStats(token, filters);
      case "tasksByFailureReason":
        return await getTasksByFailureReason(token, filters);
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  };
  