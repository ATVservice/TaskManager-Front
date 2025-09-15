import React, { useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import './taskAgGrid.css'

ModuleRegistry.registerModules([AllCommunityModule]);

const TaskAgGrid = ({ rowData, columnDefs, onCellValueChanged}) => {
    const gridRef = useRef();

    const defaultColDef = {
        filter: 'agTextColumnFilter', 
        sortable: true,
        resizable: true,
        editable: false,
        filterParams: {
            defaultOption: 'contains', // רק "מכיל"
            caseSensitive: false,
            debounceMs: 0, 
            suppressAndOrCondition: true 
        },
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
        // Pagination
        page: 'עמוד',
        more: 'עוד',
        to: 'עד',
        of: 'מתוך',
        next: 'הבא',
        last: 'אחרון',
        first: 'ראשון',
        previous: 'קודם',
        loadingOoo: 'טוען...',

        // Filter
        pageSizeSelectorLabel: 'גודל עמוד',
        filterOoo: 'סנן...',     
        searchOoo: 'סינון...',
        clearFilter: 'נקה',
        contains: 'מכיל',

        // Filter Conditions
        andCondition: 'וגם',
        orCondition: 'או',

        // Menu
        selectAll: 'בחר הכל',
        searchOoo: 'חפש...',
        blanks: 'ריקים',

        // Columns
        columns: 'עמודות',

        // Tool Panel
        pivotMode: 'מצב Pivot',
        groups: 'קבוצות',
        values: 'ערכים',
        pivots: 'Pivot-ים',
        valueColumns: 'עמודות ערך',
        pivotColumns: 'עמודות Pivot',
        toolPanelButton: 'לוח כלים',

        // Other
        noRowsToShow: 'אין שורות להצגה',
        rowGroupColumnsEmptyMessage: 'גרור כאן עמודות כדי לקבץ',
    };

    return (
        <div className="ag-theme-alpine">
             <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    pagination={true}
                    enableRtl={true}
                    paginationPageSize={20}
                    domLayout="autoHeight"
                    animateRows={true}
                    onCellValueChanged={onCellValueChanged}
                    singleClickEdit={true}
                    localeText={localeText} 
                    rowClassRules={{
                        'drawer-task': params => params.data.importance === 'מגירה'
                    }}
                    
                />
        </div>
    );
};

export default TaskAgGrid;
