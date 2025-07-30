import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css'; // חובה!

const SimpleAgGrid = ({ rowData, columnDefs }) => {
    const defaultColDef = {
        sortable: true,
        filter: true,
        resizable: true,
    };

    return (
        <div className="ag-theme-quartz" style={{ height: '500px', width: '100%' }}>
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={10}
            />
        </div>
    );
};

export default SimpleAgGrid;
