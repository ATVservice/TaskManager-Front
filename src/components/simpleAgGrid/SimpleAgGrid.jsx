import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import './SimpleAgGrid.css'

const SimpleAgGrid = ({ rowData, columnDefs }) => {
    const defaultColDef = {
        sortable: true,
        filter: true,
        resizable: true,
        flex: 1,
    };

    return (
        <div
            className="ag-theme-quartz custom-grid-rtl"
            style={{ height: '500px', width: '100%' }}
            dir="rtl"
        >            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={20}
            />
        </div>
    );
};

export default SimpleAgGrid;
