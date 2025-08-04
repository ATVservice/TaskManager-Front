// StatusEditor.jsx
import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';

const StatusEditor = forwardRef((props, ref) => {
  const { value } = props;
  const [selected, setSelected] = useState(value);

  const statusOptions = [
    { status: "בתהליך", color: 'yellow' },
    { status: "בטיפול", color: 'purple' },
    { status: "הושלם", color: 'green' },
    { status: "מושהה", color: 'gray' },
    { status: "בוטלה", color: 'red' },
  ];

  useImperativeHandle(ref, () => ({
    getValue: () => selected,
  }));

  useEffect(() => {
    // פוקוס אוטומטי
    const dropdown = document.getElementById('status-dropdown');
    if (dropdown) dropdown.focus();
  }, []);

  return (
    <select
      id="status-dropdown"
      value={selected}
      onChange={(e) => setSelected(e.target.value)}
      style={{ width: '100%' }}
    >
      {statusOptions.map((opt) => (
        <option
          key={opt.status}
          value={opt.status}
          style={{ backgroundColor: opt.color }}
        >
          {opt.status}
        </option>
      ))}
    </select>
  );
});

export default StatusEditor;
