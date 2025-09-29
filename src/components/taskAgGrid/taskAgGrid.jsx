import React, { useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { motion } from "framer-motion";
import './taskAgGrid.css'

ModuleRegistry.registerModules([AllCommunityModule]);

const TaskAgGrid = ({ rowData, columnDefs, onCellValueChanged, onRowClicked  }) => {
    const gridRef = useRef();

    const defaultColDef = {
        filter: 'agTextColumnFilter',
        sortable: true,
        resizable: true,
        editable: false,
        flex: 1,
        minWidth: 100,
        filterParams: {
            defaultOption: 'contains',
            caseSensitive: false,
            debounceMs: 0,
            suppressAndOrCondition: true,
            filterOptions: ['contains'],
            buttons: []
        },
        enableRowGroup: true,
        suppressMovable: true,
        cellClass: 'copyable-cell',
        suppressKeyboardEvent: false,
    };

    // הגדרות  לעברית
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

    return (
        <div className="ag-theme-alpine">
            <motion.div
                key={rowData?.length}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{ height: "100%", width: "100%" }}

            >
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
                    onRowClicked={onRowClicked} 
                    singleClickEdit={true}
                    localeText={localeText}
                    suppressSizeToFit={false}
                    onFirstDataRendered={(params) => {
                        params.api.sizeColumnsToFit();
                    }}
                    onGridReady={(params) => {
                        setTimeout(() => {
                            params.api.sizeColumnsToFit();
                        }, 100);
                    }}
                    onGridSizeChanged={(params) => {
                        setTimeout(() => {
                            params.api.sizeColumnsToFit();
                        }, 50);
                    }}
                    rowClassRules={{
                        'drawer-task': params => params.data.importance === 'מגירה'
                    }}
                />
            </motion.div>
        </div>
    );
};

export default TaskAgGrid;