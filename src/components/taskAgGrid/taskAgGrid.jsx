import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { motion } from "framer-motion";
import './taskAgGrid.css';

ModuleRegistry.registerModules([AllCommunityModule]);

const TaskAgGrid = forwardRef(({ highlightedId, rowData, columnDefs, onCellValueChanged, onRowClicked }, ref) => {

    const gridRef = useRef();

    useImperativeHandle(ref, () => ({
        api: gridRef.current.api,
        columnApi: gridRef.current.columnApi,
    }));

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
        suppressMovable: true,
        cellClass: 'copyable-cell',
        suppressKeyboardEvent: false,
    };

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
        noRowsToShow: 'אין שורות להצגה',
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
                    ref={(grid) => {
                        gridRef.current = grid;
                        if (ref) {
                            if (typeof ref === 'function') ref(grid);
                            else ref.current = grid;
                        }
                    }}
                    getRowId={params => params.data._id}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    pagination
                    enableRtl
                    paginationPageSize={20}
                    domLayout="autoHeight"
                    animateRows
                    onCellValueChanged={onCellValueChanged}
                    onRowClicked={onRowClicked}
                    singleClickEdit
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
                        'highlight-animation': params => params.data._id === highlightedId,
                        'drawer-task': params => params.data.importance === 'מגירה',
                    }}



                />
            </motion.div>
        </div>
    );
});

export default TaskAgGrid;
