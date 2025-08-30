import React, { useContext, useEffect, useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

import ReportsFilters from "../reportFilter/ReportsFilters.jsx";
import { getAllEmployees } from "../../../services/userService.js";
import { fetchAllAssociations } from "../../../services/associationService.js";
import { fetchReportData } from "../../../services/reportTypeService.js";
import { AuthContext } from "../../../context/AuthContext.jsx";
import "./Report.css";

const Reports = () => {
    const { user } = useContext(AuthContext);

    const [reportType, setReportType] = useState("openTasksByEmployee");
    const [filters, setFilters] = useState({
        employeeId: "",
        associationId: "",
        status: "",
        startDate: "",
        endDate: "",
        importance: "",
        subImportance: "",
        reasonId: "",
    });
    const [employees, setEmployees] = useState([]);
    const [associations, setAssociations] = useState([]);
    const reasons = [{ id: 1, name: "חוסר זמן" }, { id: 2, name: "תיעדוף אחר" }];
    const [reportData, setReportData] = useState(null);
    const [isExporting, setIsExporting] = useState(false);


    // טוען dropdowns פעם אחת בהתחלה
    useEffect(() => {
        const loadFiltersData = async () => {
            const token = user?.token;
            try {
                const [emps, assos] = await Promise.all([
                    getAllEmployees(token),
                    fetchAllAssociations(token),
                ]);
                setEmployees(emps);
                setAssociations(assos);
            } catch (err) {
                console.error("שגיאה בטעינת נתוני פילטרים:", err);
            }
        };
        loadFiltersData();
    }, []);

    useEffect(() => {
        const loadReport = async () => {
            try {
                const res = await fetchReportData(reportType, user?.token, filters);
                setReportData(res);
            } catch (err) {
                console.error("שגיאה בטעינת דוח:", err);
                setReportData(null);
            }
        };
        if (user?.token) loadReport();
    }, [reportType, filters, user?.token]);

    // פונקציות עיבוד הנתונים לכל סוג דוח
    const getTableDataByReportType = () => {
        if (!reportData?.data) {
            console.log("No reportData.data:", reportData);
            return { headers: [], rows: [] };
        }

        console.log(`Processing ${reportType} with data:`, reportData.data);

        switch (reportType) {
            case "openTasksByEmployee":
                return processOpenTasksByEmployee(reportData.data);
            case "tasksByResponsibility":
                return processTasksByResponsibility(reportData.data);
            case "overdueTasks":
                return processOverdueTasks(reportData.data);
            case "tasksSummaryByPeriod":
                return processTasksSummaryByPeriod(reportData.data);
            case "employeePersonalStats":
                return processEmployeePersonalStats(reportData);
            default:
                return { headers: [], rows: [] };
        }
    };

    // עיבוד דוח משימות פתוחות לפי עובד
    const processOpenTasksByEmployee = (data) => {
        const headers = ["עובד", "כמות משימות", "חשיבות גבוהה", "באיחור", "בתהליך"];
        const rows = [];

        data.forEach(employeeData => {
            const employee = employeeData.employee;
            const summary = employeeData.summary;

            rows.push([
                employee.name,
                summary.total,
                summary.byImportance['דחוף'] || 0,
                summary.overdue || 0,
                summary.byStatus['בתהליך'] || 0
            ]);
        });

        return { headers, rows };
    };

    // עיבוד דוח משימות לפי אחריות
    const processTasksByResponsibility = (data) => {
        const headers = ["עובד", "סוג אחריות", "כמות משימות", "הושלמו", "בתהליך", "מושהה"];
        const rows = [];

        // אחראים ראשיים
        Object.values(data.mainResponsible || {}).forEach(employeeData => {
            const summary = employeeData.summary;
            rows.push([
                employeeData.employee.name,
                "אחראי ראשי",
                summary.total,
                summary.byStatus['הושלם'] || 0,
                summary.byStatus['בתהליך'] || 0,
                summary.byStatus['מושהה'] || 0
            ]);
        });

        // אחראים משניים
        Object.values(data.secondaryResponsible || {}).forEach(employeeData => {
            const summary = employeeData.summary;
            rows.push([
                employeeData.employee.name,
                "אחראי משני",
                summary.total,
                summary.byStatus['הושלם'] || 0,
                summary.byStatus['בתהליך'] || 0,
                summary.byStatus['מושהה'] || 0
            ]);
        });

        return { headers, rows };
    };

    // עיבוד דוח משימות באיחור
    const processOverdueTasks = (data) => {
        const headers = ["מזהה משימה", "כותרת", "אחראי ראשי", "ימים באיחור", "רמת חומרה", "ארגון", "חשיבות"];

        if (!Array.isArray(data)) {
            console.log("overdueTasks data is not array:", data);
            return { headers, rows: [] };
        }

        const rows = data.map(task => [
            task.taskId || '',
            task.title || '',
            task.mainAssignee ? `${task.mainAssignee.firstName || ''} ${task.mainAssignee.lastName || ''}` : '',
            task.daysOverdue || 0,
            task.severity || '',
            task.organization?.name || "",
            task.importance || ''
        ]);

        return { headers, rows };
    };

    // עיבוד סיכום משימות לפי תקופה
    const processTasksSummaryByPeriod = (data) => {
        const headers = ["תקופה", "כמות כללית", "הושלמו", "בתהליך", "מושהה", "אחוז השלמה"];

        if (!Array.isArray(data)) {
            console.log("tasksSummaryByPeriod data is not array:", data);
            return { headers, rows: [] };
        }

        const rows = data.map(period => [
            period?.period || '',
            period?.totalTasks || 0,
            period?.byStatus?.['הושלם'] || 0,
            period?.byStatus?.['בתהליך'] || 0,
            period?.byStatus?.['מושהה'] || 0,
            `${period?.completionRate || 0}%`
        ]);

        return { headers, rows };
    };

    // עיבוד סטטיסטיקה אישית
    const processEmployeePersonalStats = (data) => {
        if (!data.stats) return { headers: [], rows: [] };

        const headers = ["מדד", "ערך"];
        const stats = data.stats.overview;
        const rows = [
            ["סה״כ משימות", stats.totalTasks],
            ["הושלמו", stats.completed],
            ["בתהליך", stats.inProgress],
            ["באיחור", stats.overdue],
            ["אחוז השלמה", `${stats.completionRate}%`]
        ];

        return { headers, rows };
    };

    // ייצוא ל-Excel עם תיקון כיוון RTL
    const exportExcel = () => {
        const tableData = getTableDataByReportType();
        if (!tableData.rows.length) return;

        try {
            const worksheet = XLSX.utils.aoa_to_sheet([tableData.headers, ...tableData.rows]);

            // הגדרת כיוון RTL עבור הגיליון כולו
            worksheet['!dir'] = 'RTL';
            if (!worksheet['!views']) worksheet['!views'] = [{}];
            worksheet['!views'][0] = { rightToLeft: true };

            // הגדרת רוחב עמודות
            const colWidths = tableData.headers.map((header, idx) => {
                if (idx === 0 || idx === 1) return { wch: 25 };
                return { wch: 15 };
            });
            worksheet['!cols'] = colWidths;

            // סגנון כותרות
            tableData.headers.forEach((header, colIdx) => {
                const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIdx });
                if (!worksheet[cellAddress]) return;

                worksheet[cellAddress].s = {
                    font: {
                        bold: true,
                        sz: 14,
                        color: { rgb: "FFFFFF" }
                    },
                    alignment: {
                        horizontal: "center",
                        vertical: "center",
                        wrapText: true,
                        readingOrder: 2
                    },
                    fill: {
                        fgColor: { rgb: "4472C4" }
                    },
                    border: {
                        top: { style: "thick", color: { rgb: "000000" } },
                        bottom: { style: "thick", color: { rgb: "000000" } },
                        left: { style: "thick", color: { rgb: "000000" } },
                        right: { style: "thick", color: { rgb: "000000" } }
                    }
                };
            });

            // סגנון תאי הנתונים
            tableData.rows.forEach((row, rowIdx) => {
                row.forEach((cell, colIdx) => {
                    const cellAddress = XLSX.utils.encode_cell({ r: rowIdx + 1, c: colIdx });
                    if (!worksheet[cellAddress]) return;

                    const isFirstTwoColumns = colIdx <= 1;

                    worksheet[cellAddress].s = {
                        alignment: {
                            horizontal: isFirstTwoColumns ? "right" : "center",
                            vertical: "center",
                            readingOrder: 2
                        },
                        border: {
                            top: { style: "thin", color: { rgb: "CCCCCC" } },
                            bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                            left: { style: "thin", color: { rgb: "CCCCCC" } },
                            right: { style: "thin", color: { rgb: "CCCCCC" } }
                        },
                        fill: {
                            fgColor: { rgb: rowIdx % 2 === 0 ? "F8F9FA" : "FFFFFF" }
                        }
                    };
                });
            });

            const workbook = XLSX.utils.book_new();
            workbook.Workbook = {
                Views: [{
                    RTL: true
                }]
            };

            XLSX.utils.book_append_sheet(workbook, worksheet, "דוח");

            const reportNames = {
                openTasksByEmployee: "משימות פתוחות לפי עובד",
                tasksByResponsibility: "משימות לפי אחריות",
                overdueTasks: "משימות חורגות מיעד",
                tasksSummaryByPeriod: "סיכום משימות לפי תקופה",
                employeePersonalStats: "סטטיסטיקה אישית"
            };

            XLSX.writeFile(workbook, `${reportNames[reportType]}.xlsx`);
        } catch (error) {
            console.error("שגיאה בייצוא Excel:", error);
            alert("שגיאה בייצוא קובץ Excel");
        }
    };

    // פתרון PDF עם HTML2Canvas (עברית מושלמת)
    const exportPDFWithCanvas = async () => {
        const tableData = getTableDataByReportType();
        if (!tableData.rows.length) return;

        setIsExporting(true);
        try {
            const tempContainer = document.createElement('div');
            tempContainer.style.cssText = `
                position: absolute;
                top: -9999px;
                left: -9999px;
                width: 800px;
                padding: 20px;
                background: white;
                font-family: 'Segoe UI', 'Arial Unicode MS', Arial, sans-serif;
                direction: rtl;
            `;

            const reportNames = {
                openTasksByEmployee: "משימות פתוחות לפי עובד",
                tasksByResponsibility: "משימות לפי אחריות",
                overdueTasks: "משימות חורגות מיעד",
                tasksSummaryByPeriod: "סיכום משימות לפי תקופה",
                employeePersonalStats: "סטטיסטיקה אישית"
            };

            tempContainer.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #2c3e50; margin: 0; font-size: 24px;">${reportNames[reportType]}</h2>
                    <p style="margin: 5px 0; color: #666;">תאריך: ${new Date().toLocaleDateString('he-IL')}</p>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <thead>
                        <tr style="background: #3498db; color: white;">
                            ${tableData.headers.map(header =>
                `<th style="padding: 12px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${header}</th>`
            ).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${tableData.rows.map((row, idx) => `
                            <tr style="background: ${idx % 2 === 0 ? '#f8f9fa' : 'white'};">
                                ${row.map((cell, cellIdx) =>
                `<td style="padding: 10px; border: 1px solid #ddd; text-align: ${cellIdx <= 1 ? 'right' : 'center'};">${cell}</td>`
            ).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            document.body.appendChild(tempContainer);
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(tempContainer, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            document.body.removeChild(tempContainer);

            const imgData = canvas.toDataURL('image/png');
            const doc = new jsPDF();

            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                doc.addPage();
                doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            doc.save(`${reportNames[reportType]}.pdf`);

        } catch (error) {
            console.error("שגיאה ב-HTML2Canvas:", error);
            alert("שגיאה בייצוא PDF עברית. מנסה פתרון חלופי...");
            exportPDFEnglish();
        } finally {
            setIsExporting(false);
        }
    };

    // פתרון PDF באנגלית (תמיד עובד)
    const exportPDFEnglish = () => {
        const tableData = getTableDataByReportType();
        if (!tableData.rows.length) return;

        try {
            const doc = new jsPDF();
            doc.setFont('helvetica', 'normal');

            // מיפוי כותרות לאנגלית
            const headerMapping = {
                'עובד': 'Employee',
                'כמות משימות': 'Tasks Count',
                'חשיבות גבוהה': 'High Priority',
                'באיחור': 'Overdue',
                'בתהליך': 'In Progress',
                'הושלמו': 'Completed',
                'מושהה': 'Suspended',
                'סוג אחריות': 'Responsibility Type',
                'אחראי ראשי': 'Main Responsible',
                'אחראי משני': 'Secondary',
                'מזהה משימה': 'Task ID',
                'כותרת': 'Title',
                'ימים באיחור': 'Days Overdue',
                'רמת חומרה': 'Severity',
                'ארגון': 'Organization',
                'חשיבות': 'Priority',
                'תקופה': 'Period',
                'כמות כללית': 'Total',
                'אחוז השלמה': 'Completion %',
                'מדד': 'Metric',
                'ערך': 'Value'
            };

            // מיפוי ערכים לאנגלית
            const valueMapping = {
                'בתהליך': 'In Progress',
                'הושלם': 'Completed',
                'מושהה': 'Suspended',
                'דחוף': 'Urgent',
                'גבוהה': 'High',
                'בינונית': 'Medium',
                'נמוכה': 'Low',
                'אחראי ראשי': 'Main Responsible',
                'אחראי משני': 'Secondary'
            };

            const englishHeaders = tableData.headers.map(h => headerMapping[h] || h);
            const convertedRows = tableData.rows.map(row =>
                row.map((cell, idx) => {
                    if (typeof cell === 'number' || !isNaN(cell)) return cell;
                    if (idx === 0) return cell; // שמות עובדים נשארים
                    return valueMapping[cell] || cell;
                })
            );

            doc.setFontSize(18);
            doc.text('Management Report', 105, 25, { align: 'center' });

            doc.setFontSize(12);
            doc.text(`Generated: ${new Date().toLocaleDateString('en-US')}`, 105, 35, { align: 'center' });

            autoTable(doc, {
                head: [englishHeaders],
                body: convertedRows,
                startY: 50,
                styles: {
                    fontSize: 10,
                    cellPadding: 4
                },
                headStyles: {
                    fillColor: [52, 152, 219],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                alternateRowStyles: { fillColor: [248, 249, 250] }
            });

            const reportNames = {
                openTasksByEmployee: "Open_Tasks_By_Employee",
                tasksByResponsibility: "Tasks_By_Responsibility",
                overdueTasks: "Overdue_Tasks",
                tasksSummaryByPeriod: "Tasks_Summary_By_Period",
                employeePersonalStats: "Employee_Personal_Stats"
            };

            doc.save(`${reportNames[reportType] || 'Management_Report'}.pdf`);

        } catch (error) {
            console.error("שגיאה בPDF אנגלית:", error);
            alert("שגיאה בייצוא PDF");
        }
    };

    const tableData = getTableDataByReportType();
    return (
        <div className="reports-container">
            <h2 className="reports-title">📊 דוחות מנהל</h2>
    
            <div className="reports-layout">
                {/* דיב של הסינונים */}
                <div className="filters-panel">
                    <ReportsFilters
                        filters={filters}
                        setFilters={setFilters}
                        employees={employees}
                        associations={associations}
                        reasons={reasons}
                    />
                </div>
    
                {/* דיב של הטבלה וכל שאר התוכן */}
                <div className="reports-content">

                                    {/* כפתורי ייצוא */}
                                    <div className="export-buttons">
                        <button
                            onClick={exportExcel}
                            className="btn btn-excel"
                            disabled={!reportData?.data || tableData.rows.length === 0}
                        >
                            📥 ייצוא Excel
                        </button>
    
                        <button
                            onClick={exportPDFWithCanvas}
                            className="btn btn-pdf"
                            disabled={!reportData?.data || tableData.rows.length === 0 || isExporting}
                        >
                            {isExporting ? '⏳' : '📥'} PDF עברית
                            {isExporting && <span className="loading-text">(יוצר...)</span>}
                        </button>
                    </div>

                    
                    {/* בחירת סוג דוח */}
                    <div className="report-type">
                        <label className="report-label">סוג דוח:</label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="report-select"
                        >
                            <option value="openTasksByEmployee">משימות פתוחות לפי עובד</option>
                            <option value="tasksByResponsibility">משימות לפי אחריות</option>
                            <option value="overdueTasks">משימות חורגות מיעד</option>
                            <option value="tasksSummaryByPeriod">סיכום משימות לפי תקופה</option>
                            <option value="employeePersonalStats">סטטיסטיקה אישית</option>
                        </select>
                    </div>
    
    
    
                    {/* סטטיסטיקות */}
                    {reportData?.statistics && (
                        <div className="statistics-box">
                            <h3 className="statistics-title">סטטיסטיקות כלליות:</h3>
                            <div className="statistics-grid">
                                <div>סה״כ משימות: <span className="bold">{reportData.statistics.total}</span></div>
                                {reportData.statistics.averageDaysOverdue !== undefined && (
                                    <div>ממוצע ימים באיחור: <span className="bold">{reportData.statistics.averageDaysOverdue}</span></div>
                                )}
                                {reportData.overallStats && (
                                    <>
                                        <div>ממוצע משימות לתקופה: <span className="bold">{reportData.overallStats.averageTasksPerPeriod}</span></div>
                                        <div>ממוצע אחוז השלמה: <span className="bold">{reportData.overallStats.averageCompletionRate}%</span></div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
    
                    {/* טבלה */}
                    {tableData.headers.length > 0 ? (
                        <div className="table-wrapper">
                            <table className="reports-table">
                                <thead>
                                    <tr>
                                        {tableData.headers.map((header, idx) => (
                                            <th key={idx}>{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.rows.map((row, rowIdx) => (
                                        <tr key={rowIdx}>
                                            {row.map((cell, cellIdx) => (
                                                <td key={cellIdx}>{String(cell)}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="no-data">
                            {reportData === null ? "טוען נתונים..." : "אין נתונים להצגה"}
                        </div>
                    )}
    
                    {/* פעילות אחרונה */}
                    {reportType === "employeePersonalStats" && reportData?.stats?.recentActivity && (
                        <div className="recent-activity">
                            <h3 className="activity-title">פעילות אחרונה:</h3>
                            <div className="activity-list">
                                {reportData.stats.recentActivity.slice(0, 5).map((activity, idx) => (
                                    <div key={idx} className="activity-item">
                                        <div className="activity-name">{activity.title}</div>
                                        <div className="activity-details">
                                            סטטוס: {activity.status} | חשיבות: {activity.importance}
                                            {activity.organization && ` | ${activity.organization}`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}    

export default Reports;