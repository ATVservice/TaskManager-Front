import React, { useState } from "react";
import "./MultiSelect.css"; // אם יש לך קובץ עיצוב

export default function MultiSelect({ placeholder = "בחר", options = [], selected = [], onChange }) {
  const [open, setOpen] = useState(false);

  const toggleOption = (option) => {
    let newSelected;
    if (selected.includes(option)) {
      newSelected = selected.filter((opt) => opt !== option);
    } else {
      newSelected = [...selected, option];
    }
    onChange(newSelected);
  };

  return (
    <div className={`select-multiple ${open ? "open" : ""}`}>
      <div className="active-area" onClick={() => setOpen(!open)}>
        {selected.length > 0 ? (
          selected.map((opt) => (
            <span key={opt} className="selected-tag">
              {opt}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(opt);
                }}
              >
                &times;
              </button>
            </span>
          ))
        ) : (
          <span className="placeholder">{placeholder}</span>
        )}
        <div className="arrow" />
      </div>
      {open && (
        <ul className="options">
          {options
            .filter((opt) => !selected.includes(opt))
            .map((opt) => (
              <li key={opt} onClick={() => toggleOption(opt)}>
                {opt}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
