import * as XLSX from "xlsx";

// יצוא ל-CSV
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;

  const csvContent =
    Object.keys(data[0]).join(",") +
    "\n" +
    data.map((row) => Object.values(row).join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// יצוא ל-Excel
export const exportToExcel = (data, filename) => {
  if (!data || data.length === 0) return;

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");

  XLSX.writeFile(wb, filename);
};
