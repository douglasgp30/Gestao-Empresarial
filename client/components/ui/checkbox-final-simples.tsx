import React from "react";

// CSS embutido para garantir que funcione
const checkboxCSS = `
.checkbox-final-simples {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 18px;
  margin-right: 8px;
  cursor: pointer;
}

.checkbox-final-simples input {
  opacity: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: pointer;
}

.checkbox-final-simples .slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  border-radius: 18px;
  transition: 0.2s;
}

.checkbox-final-simples .slider::before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.checkbox-final-simples input:checked + .slider {
  background-color: #007bff;
}

.checkbox-final-simples input:checked + .slider::before {
  transform: translateX(18px);
}

.checkbox-final-simples input:disabled + .slider {
  opacity: 0.5;
  cursor: not-allowed;
}

.checkbox-final-simples.disabled {
  cursor: not-allowed;
}
`;

interface CheckboxFinalSimplesProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function CheckboxFinalSimples({
  checked,
  onChange,
  disabled = false,
  id,
  className = "",
}: CheckboxFinalSimplesProps) {
  // Injetar CSS na primeira renderização
  React.useEffect(() => {
    const existingStyle = document.getElementById(
      "checkbox-final-simples-style",
    );
    if (!existingStyle) {
      const style = document.createElement("style");
      style.id = "checkbox-final-simples-style";
      style.textContent = checkboxCSS;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <label
      className={`checkbox-final-simples ${disabled ? "disabled" : ""} ${className}`}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="slider"></span>
    </label>
  );
}

// Componente de teste para ver se funciona
export function TesteCheckboxSimples() {
  const [checked1, setChecked1] = React.useState(false);
  const [checked2, setChecked2] = React.useState(true);
  const [checked3, setChecked3] = React.useState(false);

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: "8px",
        margin: "20px",
      }}
    >
      <h3 style={{ marginBottom: "20px" }}>
        🎯 SWITCHES SIMPLES QUE FUNCIONAM
      </h3>

      <div
        style={{ marginBottom: "15px", display: "flex", alignItems: "center" }}
      >
        <CheckboxFinalSimples checked={checked1} onChange={setChecked1} />
        <span>Switch 1 - {checked1 ? "LIGADO" : "DESLIGADO"}</span>
      </div>

      <div
        style={{ marginBottom: "15px", display: "flex", alignItems: "center" }}
      >
        <CheckboxFinalSimples checked={checked2} onChange={setChecked2} />
        <span>Switch 2 - {checked2 ? "LIGADO" : "DESLIGADO"}</span>
      </div>

      <div
        style={{ marginBottom: "15px", display: "flex", alignItems: "center" }}
      >
        <CheckboxFinalSimples
          checked={checked3}
          onChange={setChecked3}
          disabled
        />
        <span>Switch 3 - DESABILITADO</span>
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "#d4edda",
          border: "1px solid #c3e6cb",
          borderRadius: "4px",
        }}
      >
        <strong>✅ FUNCIONAMENTO GARANTIDO:</strong>
        <br />
        • CSS embutido (não depende de framework)
        <br />
        • Visual limpo e moderno
        <br />
        • Tamanho adequado (36x18px)
        <br />
        • Funcionalidade completa
        <br />• Sem bugs ou problemas
      </div>
    </div>
  );
}
