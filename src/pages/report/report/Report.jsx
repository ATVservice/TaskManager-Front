import React, { useCallback, useContext, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import ReportsFilters from "../reportFilter/ReportsFilters.jsx";
import { getAllEmployees } from "../../../services/userService.js";
import { fetchAllAssociations } from "../../../services/associationService.js";
import { fetchReportData } from "../../../services/reportTypeService.js";
import { AuthContext } from "../../../context/AuthContext.jsx";
import { fetchLoadSavedFilter, fetchResetFilter } from "../../../services/reportFiltersService.js";
import { Download } from "lucide-react";
import "./Report.css";
import toast from "react-hot-toast";
import { Title } from "react-head";


const Reports = () => {
    const { user } = useContext(AuthContext);
    const [isResetting, setIsResetting] = useState(false);
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
    const [periodType, setPeriodType] = useState('month');
    const [responsibilityType, setResponsibilityType] = useState('all');

    const getScreenTypeByReportType = (reportType) => {
        const mapping = {
            'openTasksByEmployee': 'openTasks',
            'tasksByResponsibility': 'tasksByResponsibility',
            'overdueTasks': 'overdueTasks',
            'tasksSummaryByPeriod': 'tasksByPeriod',
            'employeePersonalStats': 'employeeStats'
        };
        return mapping[reportType] || 'general';
    };


    // פונקציה  לטעינת פילטר שמור
    const loadSavedFilter = useCallback(async (screenType) => {
        try {
            console.log(`Loading filter for screen: ${screenType}`);
            const result = await fetchLoadSavedFilter(screenType, user?.token);

            if (result.success && result.filter && Object.keys(result.filter).length > 0) {
                console.log('טוען פילטר שמור:', result.filter);
                setFilters(prev => ({
                    ...prev,
                    ...result.filter
                }));
            } else {
                console.log('No saved filter found or filter is empty');
                return {};
            }
        } catch (error) {
            console.error('שגיאה בטעינת פילטר שמור:', error);
            return {};
        }
    }, [user?.token]);

    useEffect(() => {
        const loadBasicData = async () => {
            if (!user?.token) return;

            try {
                const [emps, assos] = await Promise.all([
                    getAllEmployees(user.token),
                    fetchAllAssociations(user.token),
                ]);
                setEmployees(emps);
                setAssociations(assos);
            } catch (err) {
                console.error(" Error loading basic data:", err);
            }
        };

        loadBasicData();
    }, [user?.token]);

    useEffect(() => {
        if (user?.token && employees.length > 0) {
            const screenType = getScreenTypeByReportType(reportType);
            loadSavedFilter(screenType);
        }
    }, [reportType, employees.length, loadSavedFilter]);

    // טעינת דוחות כשמשתנים פילטרים
    useEffect(() => {
        const loadReport = async () => {
            if (!user?.token) return;

            try {
                console.log('📊 Loading report with filters:', {
                    reportType,
                    filters,
                    periodType,
                    responsibilityType
                });

                const res = await fetchReportData(reportType, user?.token, {
                    ...filters,
                    period: periodType,
                    responsibilityType: responsibilityType
                });

                setReportData(res);

            } catch (err) {
                console.error("Error loading report:", err);
                setReportData(null);
            }
        };

        // עיכוב קטן כדי לוודא שהפילטרים התעדכנו
        const timeoutId = setTimeout(loadReport, 300);
        return () => clearTimeout(timeoutId);

    }, [filters, periodType, responsibilityType, reportType, user?.token]);

    // פונקציות עיבוד הנתונים לכל סוג דוח
    const getTableDataByReportType = () => {
        if (!reportData?.data) {
            console.log("No reportData.data:", reportData);
            return { headers: [], rows: [] };
        }

        console.log(`Processing ${reportType} with data:`, reportData.data);

        switch (reportType) {
            case "openTasksByEmployee":
                return processOpenTasksByEmployee(reportData.data || []);
            case "tasksByResponsibility":
                return processTasksByResponsibility(reportData.data || []);
            case "overdueTasks":
                return processOverdueTasks(reportData.data || []);
            case "tasksSummaryByPeriod":
                return processTasksSummaryByPeriod(reportData.data || []);
            case "employeePersonalStats":
                return processEmployeePersonalStats(reportData?.data || []);

            default:
                return { headers: [], rows: [] };
        }
    };

    // עיבוד דוח משימות פתוחות לפי עובד

    const processOpenTasksByEmployee = (data) => {
        const headers = ["שם משתמש", "שם עובד", "כמות משימות","לביצוע", "בטיפול", "באיחור", "ממוצע ימים פתוחים", "המשימה הכי ישנה בימים"];
        const rows = [];

        const employees = Array.isArray(data) ? data : data?.employees || [];
        employees.forEach(employeeData => {
            const employee = employeeData.employee || {};
            const summary = employeeData.summary || {};

            rows.push([
                employee.userName ?? '---',
                employee.name ?? '---',
                summary.total ?? 0,
                summary.byStatus?.['לביצוע'] ?? 0,
                summary.byStatus?.['בטיפול'] ?? 0,
                summary.overdue ?? 0,
                summary.avgDaysOpen ?? 0,
                summary.oldestOpenDays ?? 0
            ]);
        });

        return { headers, rows };
    };

    // עיבוד דוח משימות לפי אחריות
    const processTasksByResponsibility = (data) => {
        const headers = ["שם משתמש", "שם עובד", "סוג אחריות", "", "הושלמו", "לביצוע"];
        const rows = [];

        // אחראים ראשיים
        Object.values(data.mainResponsible || {}).forEach(employeeData => {
            const summary = employeeData.summary;
            rows.push([
                employeeData.employee.userName || '---',
                employeeData.employee.name || '---',
                "אחראי ראשי",
                summary.total || 0,
                summary.byStatus['הושלם'] || 0,
                summary.byStatus['לביצוע'] || 0,
            ]);
        });

        // אחראים משניים
        Object.values(data.secondaryResponsible || {}).forEach(employeeData => {
            const summary = employeeData.summary;
            rows.push([
                employeeData.employee.userName,
                employeeData.employee.name,
                "אחראי משני",
                summary.total,
                summary.byStatus['הושלם'] || 0,
                summary.byStatus['לביצוע'] || 0,
            ]);
        });

        return { headers, rows };
    };

    // עיבוד דוח משימות באיחור
    const processOverdueTasks = (data) => {
        const headers = ["מזהה משימה", "כותרת", "פרטים", "סיבת אי ביצוע", "אחראי ראשי", "ימים באיחור", "רמת חומרה", "ארגון", "חשיבות"];

        if (!Array.isArray(data)) {
            console.log("overdueTasks data is not array:", data);
            return { headers, rows: [] };
        }

        const rows = data.map(task => [
            task.taskId || '---',
            task.title || '---',
            task.details || '---',
            task.failureReason || '---',
            task.mainAssignee ? `${task.mainAssignee.firstName || ''} ${task.mainAssignee.lastName || ''}` : '---',
            task.daysOverdue || 0,
            task.severity || '---',
            task.organization?.name || "---",
            task.importance || '---'
        ]);

        return { headers, rows };
    };
    const processOverdueTasksForExport = (data) => {
        const headers = [
            "מזהה משימה",
            "כותרת",
            "פרטים",
            "פרויקט",
            "סיבת אי ביצוע",
            "אחראי ראשי",
            "אחראי משני",
            "ימים באיחור",
            "רמת חומרה",
            "ארגון",
            "חשיבות",
            "תת חשיבות",
            "יוצר",
            "תאריך יעד",
            "תאריך סופי",
            "תאריך יצירה",
            "תאריך עדכון",
            "סטטוס",
            "הערות סטטוס",
            "האם משימה חוזרת"
        ];

        const rows = data.map(task => [
            task.taskId || '---',
            task.title || '---',
            task.details || '---',
            task.project || '---',
            task.failureReason || '---',
            task.mainAssignee ? `${task.mainAssignee.firstName} ${task.mainAssignee.lastName}` : '---',
            task.assignees?.filter(a => a._id !== task.mainAssignee?._id).map(a => `${a.firstName} ${a.lastName}`).join(', ') || '---',
            task.daysOverdue || 0,
            task.severity || '---',
            task.organization?.name || '---',
            task.importance || '---',
            task.subImportance || '---',
            task.creator ? `${task.creator.firstName} ${task.creator.lastName}` : '---',
            task.dueDate ? new Date(task.dueDate).toLocaleDateString('he-IL') : '---',
            task.finalDeadline ? new Date(task.finalDeadline).toLocaleDateString('he-IL') : '---',
            task.createdAt ? new Date(task.createdAt).toLocaleDateString('he-IL') : '---',
            task.updatedAt ? new Date(task.updatedAt).toLocaleDateString('he-IL') : '---',
            task.status || '---',
            task.statusNote || '',
            task.isRecurringInstance ? 'כן' : 'לא'
        ]);

        return { headers, rows };
    };

    // עיבוד סיכום משימות לפי תקופה
    const processTasksSummaryByPeriod = (data) => {
        const headers = ["תקופה", "הושלמו", "כללי", "עקביות", "תאריך", "מיידי", "מגירה"];

        if (!Array.isArray(data)) {
            console.log("tasksSummaryByPeriod data is not array:", data);
            return { headers, rows: [] };
        }

        const rows = data.map(period => [
            period?.period || '---',
            period?.completedTasks || 0,
            period?.byImportance?.['כללי'] || 0,
            period?.byImportance?.['עקביות'] || 0,
            period?.byImportance?.['תאריך'] || 0,
            period?.byImportance?.['מיידי'] || 0,
            period?.byImportance?.['מגירה'] || 0,
            // `${period?.completionRate || 0}%`
        ]);

        return { headers, rows };
    };
    // עיבוד סטטיסטיקה אישית
    const processEmployeePersonalStats = (data) => {
        console.log("data stat", data);
        const headers = ["שם משתמש", "שם מלא", "משימות שהושלמו", "אחוז השלמה", "אחוז עמידה בזמנים", "אחוז עמידה ביעדים"];
        if (!Array.isArray(data) || data.length === 0) return { headers, rows: [] };

        const rows = data.map(stat => [
            stat?.userName || '---',
            stat?.employeeName || '---',
            stat?.tasksCompleted || 0,
            `${stat?.completionRate || 0}%`,
            `${stat?.onTimeRate || 0}%`,
            `${stat?.goalAchievementRate || 0}%`

        ]);
        return { headers, rows };
    };

    // ייצוא ל-Excel עם תיקון כיוון RTL
    const exportExcel = () => {

        let tableData;
        if (reportType === "overdueTasks") {
            tableData = processOverdueTasksForExport(reportData.data || []);
        } else {
            tableData = getTableDataByReportType();
        }

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
            toast.error("אין אפשרות לייצא כרגע", { duration: 3000 });
        }
    };

    // פתרון PDF עם HTML2Canvas (עברית )
    const exportPDFWithCanvas = async () => {
        let tableData;
        if (reportType === "overdueTasks") {
            tableData = processOverdueTasksForExport(reportData.data || []);
        } else {
            tableData = getTableDataByReportType();
        }

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
            toast.error("שגיאה בייצוא, מנסה פתרון חילופי...", { duration: 3000 });
            exportPDFEnglish();
        } finally {
            setIsExporting(false);
        }
    };

    // פתרון PDF באנגלית)
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
                "לביצוע": "To Do",
                'הושלמו': 'Completed',
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
                'לביצוע': 'To Do',
                'בטיפול': 'In Progress',
                'הושלם': 'Completed',
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
            toast.error("אין אפשרות לייצא כרגע", { duration: 3000 });
        }
    };

    const tableData = getTableDataByReportType();
    return (
        <>
            <Title>דוחות</Title>

            <div className="reports-container">

                <div className="reports-layout">
                    {/* דיב של הסינונים */}
                    <div className="filters-panel">
                        <ReportsFilters
                            filters={filters}
                            setFilters={setFilters}
                            employees={employees}
                            associations={associations}
                            reasons={reasons}
                            reportType={reportType}
                        />
                    </div>

                    <div className="reports-content">

                        <div className="export-buttons">
                            <button
                                onClick={exportExcel}
                                className="btn btn-excel"
                                disabled={!reportData?.data || tableData.rows.length === 0}
                            >
                                <Download size={20} color="#ffffff" strokeWidth={2} />
                                ייצוא Excel
                            </button>

                            <button
                                onClick={exportPDFWithCanvas}
                                className="btn btn-pdf"
                                disabled={!reportData?.data || tableData.rows.length === 0 || isExporting}
                            >
                                <Download size={20} color="#ffffff" strokeWidth={2} />
                                ייצוא PDF
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
                        {/* בחירת תקופה לדוח סיכום משימות לפי תקופה */}
                        {reportType === "tasksByResponsibility" && (
                            <div className="period-tabs">
                                <button
                                    className={responsibilityType === 'all' ? 'active' : ''}
                                    onClick={() => setResponsibilityType('all')}
                                >
                                    הכל
                                </button>
                                <button
                                    className={responsibilityType === 'main' ? 'active' : ''}
                                    onClick={() => setResponsibilityType('main')}
                                >
                                    ראשי
                                </button>
                                <button
                                    className={responsibilityType === 'secondary' ? 'active' : ''}
                                    onClick={() => setResponsibilityType('secondary')}
                                >
                                    משני
                                </button>
                            </div>
                        )}

                        {/*בחירת סוג אחריות רצוי*/}
                        {reportType === "tasksSummaryByPeriod" && (
                            <div className="period-tabs">
                                <button
                                    className={periodType === 'week' ? 'active' : ''}
                                    onClick={() => setPeriodType('week')}
                                >
                                    שבוע
                                </button>
                                <button
                                    className={periodType === 'month' ? 'active' : ''}
                                    onClick={() => setPeriodType('month')}
                                >
                                    חודש
                                </button>
                                <button
                                    className={periodType === 'year' ? 'active' : ''}
                                    onClick={() => setPeriodType('year')}
                                >
                                    שנה
                                </button>
                            </div>
                        )}
                        {/* סטטיסטיקות */}
                        {reportData?.statistics && (
                            <div className="statistics-box">
                                {/* <h3 className="statistics-title">סטטיסטיקות כלליות:</h3> */}
                                <div className="statistics-grid">
                                    {/* <div>סה״כ משימות: <span className="bold">{reportData.statistics.total}</span></div> */}
                                    {/* {reportData.statistics.averageDaysOverdue !== undefined && (
                                    <div>ממוצע ימים באיחור: <span className="bold">{reportData.statistics.averageDaysOverdue}</span></div>
                                )} */}
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
            </div >
        </>

    );
}

export default Reports;