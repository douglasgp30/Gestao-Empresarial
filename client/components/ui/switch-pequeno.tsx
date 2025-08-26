import React from "react";

interface SwitchPequenoProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function SwitchPequeno({
  checked,
  onChange,
  disabled = false,
}: SwitchPequenoProps) {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        width: "32px",
        height: "16px",
        backgroundColor: checked ? "#007bff" : "#d1d5db",
        borderRadius: "16px",
        position: "relative",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background-color 0.2s",
        opacity: disabled ? 0.5 : 1,
        marginRight: "8px",
        display: "inline-block",
      }}
    >
      <div
        style={{
          width: "12px",
          height: "12px",
          backgroundColor: "white",
          borderRadius: "50%",
          position: "absolute",
          top: "2px",
          left: checked ? "18px" : "2px",
          transition: "left 0.2s",
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
        }}
      />
    </div>
  );
}

// Versão ainda mais básica se precisar
export function SwitchMinimoBasico({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: "28px",
        height: "14px",
        backgroundColor: checked ? "#007bff" : "#ccc",
        border: "none",
        borderRadius: "14px",
        position: "relative",
        cursor: "pointer",
        marginRight: "6px",
      }}
    >
      <div
        style={{
          width: "10px",
          height: "10px",
          backgroundColor: "white",
          borderRadius: "50%",
          position: "absolute",
          top: "2px",
          left: checked ? "16px" : "2px",
          transition: "left 0.15s",
        }}
      />
    </button>
  );
}
