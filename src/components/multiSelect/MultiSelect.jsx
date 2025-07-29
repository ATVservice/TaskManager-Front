import React, { useState } from "react";
import "./MultiSelect.css"; // אם יש לך קובץ עיצוב

export default function MultiSelect({ placeholder = "בחר", options = [], selected = [], onChange }) {
  const [open, setOpen] = useState(false);

  const toggleOption = (option) => {
    const exists = selected.some((opt) => opt._id === option._id);
    const newSelected = exists
      ? selected.filter((opt) => opt._id !== option._id)
      : [...selected, option];
    onChange(newSelected);
  };

  return (
    <div className={`select-multiple ${open ? "open" : ""}`}>
      <div className="active-area" onClick={() => setOpen(!open)}>
        {selected.length > 0 ? (
          selected.map((opt) => (
            <span key={opt._id} className="selected-tag">
              {opt.userName}
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
            .filter((opt) => !selected.some((s) => s._id === opt._id))
            .map((opt) => (
              <li key={opt._id} onClick={() => toggleOption(opt)}>
                {opt.userName}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
