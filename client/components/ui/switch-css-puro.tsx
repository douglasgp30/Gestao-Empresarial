import React from "react";

interface SwitchCSSPuroProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}

export function SwitchCSSPuro({
  checked,
  onChange,
  disabled = false,
  id,
}: SwitchCSSPuroProps) {
  const switchStyle: React.CSSProperties = {
    position: "relative",
    display: "inline-block",
    width: "40px",
    height: "20px",
    backgroundColor: checked ? "#007bff" : "#ccc",
    borderRadius: "20px",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background-color 0.2s",
    opacity: disabled ? 0.5 : 1,
  };

  const thumbStyle: React.CSSProperties = {
    position: "absolute",
    top: "2px",
    left: checked ? "22px" : "2px",
    width: "16px",
    height: "16px",
    backgroundColor: "white",
    borderRadius: "50%",
    transition: "left 0.2s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
  };

  return (
    <div style={switchStyle} onClick={() => !disabled && onChange(!checked)}>
      <div style={thumbStyle} />
    </div>
  );
}

// CSS inline para garantir funcionamento
const SwitchStyles = `
.switch-simples {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.switch-simples.on {
  background-color: #007bff;
}

.switch-simples.off {
  background-color: #ccc;
}

.switch-simples .thumb {
  position: absolute;
  top: 2px;
  width: 16px;
  height: 16px;
  background-color: white;
  border-radius: 50%;
  transition: left 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.switch-simples.on .thumb {
  left: 22px;
}

.switch-simples.off .thumb {
  left: 2px;
}

.switch-simples:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
`;

// Componente com CSS via style tag
export function SwitchComCSS({
  checked,
  onChange,
  disabled = false,
}: SwitchCSSPuroProps) {
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = SwitchStyles;
    document.head.appendChild(style);

    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  return (
    <div
      className={`switch-simples ${checked ? "on" : "off"}`}
      onClick={() => !disabled && onChange(!checked)}
    >
      <div className="thumb" />
    </div>
  );
}
