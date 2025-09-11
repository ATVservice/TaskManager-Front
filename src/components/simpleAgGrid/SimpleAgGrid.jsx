import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import './SimpleAgGrid.css'

const SimpleAgGrid = ({ rowData, columnDefs }) => {
    const defaultColDef = {
        filter: 'agTextColumnFilter',
        sortable: true,
        resizable: true,
        editable: false,
        filterParams: {
            filterOptions: ['contains'],
            debounceMs: 0,
            caseSensitive: false,
            suppressAndOrCondition: true,
            buttons: []
        },
        enableRowGroup: true,
        suppressMovable: true,
        cellClass: 'copyable-cell',
        suppressKeyboardEvent: false,
    };

    // הגדרות Localization לעברית
    const localeText = {
        page: 'עמוד',
        more: 'עוד',
        to: 'עד',
        of: 'מתוך',
        next: 'הבא',
        last: 'אחרון',
        first: 'ראשון',
        previous: 'קודם',
        loadingOoo: 'טוען...',
        pageSizeSelectorLabel: 'גודל עמוד',
        filterOoo: 'סנן...',    
        searchOoo: 'סינון...',
        clearFilter: 'נקה',
        contains: 'מכיל',
        andCondition: 'וגם',
        orCondition: 'או',
        selectAll: 'בחר הכל',
        blanks: 'ריקים',
        columns: 'עמודות',
        pivotMode: 'מצב Pivot',
        groups: 'קבוצות',
        values: 'ערכים',
        pivots: 'Pivot-ים',
        valueColumns: 'עמודות ערך',
        pivotColumns: 'עמודות Pivot',
        toolPanelButton: 'לוח כלים',
        noRowsToShow: 'אין שורות להצגה',
        rowGroupColumnsEmptyMessage: 'גרור כאן עמודות כדי לקבץ',
    };

    const gridOptions = {
        onGridReady: (params) => {
            // מתחים את הטבלה לרוחב מלא
            params.api.sizeColumnsToFit();
        },
        onFirstDataRendered: (params) => {
            // מתחים את הטבלה לרוחב מלא
            params.api.sizeColumnsToFit();
        },
        onGridSizeChanged: (params) => {
            // מתחים את הטבלה כשהגודל משתנה
            params.api.sizeColumnsToFit();
        }
    };

    return (
        <div
            className="ag-theme-quartz custom-grid-rtl"
            style={{ 
                height: '600px', 
                width: '100%',
                
            }}
            dir="rtl"
        >            
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={20}
                paginationNumberFormatter={(params) => params.value.toLocaleString('he-IL')}
                localeText={localeText}
                gridOptions={gridOptions}
                suppressHorizontalScroll={false}
                enableRtl={true}
                rowHeight={40}
                headerHeight={40}
                suppressPaginationPanel={false}
                paginationAutoPageSize={false}
            />
        </div>
    );
};

export default SimpleAgGrid;