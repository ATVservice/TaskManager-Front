import React from "react";

export default function UpdateBanner({ onRefresh }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "#ffcc00",
        color: "#222",
        textAlign: "center",
        padding: "10px",
        fontWeight: "bold",
        zIndex: 1000,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      גרסה חדשה זמינה 🎉{" "}
      <button
        onClick={onRefresh}
        style={{
          marginRight: "10px",
          backgroundColor: "#222",
          color: "#fff",
          border: "none",
          padding: "6px 12px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        רענן עכשיו
      </button>
    </div>
  );
}
