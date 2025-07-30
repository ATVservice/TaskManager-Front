import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import './TasksTable.css';

const TasksTable = ({
  columnDefs,
  rowData,
  gridRef,
  onRowClicked,
  onGridReady,
}) => {
  return (
    <div className="ag-theme-alpine" style={{ height: '70vh', width: '100%' }}>
      <AgGridReact
        columnDefs={columnDefs}
        rowData={rowData}
        ref={gridRef}
        onRowClicked={onRowClicked}
        onGridReady={onGridReady}
        rowSelection="single"
        animateRows
      />
    </div>
  );
};

export default TasksTable;
