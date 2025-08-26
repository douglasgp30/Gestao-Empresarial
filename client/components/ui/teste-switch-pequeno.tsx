import React, { useState } from "react";
import { SwitchPequeno, SwitchMinimoBasico } from "./switch-pequeno";

export function TesteSwitchPequeno() {
  const [switch1, setSwitch1] = useState(false);
  const [switch2, setSwitch2] = useState(true);
  const [switch3, setSwitch3] = useState(false);
  const [switch4, setSwitch4] = useState(true);

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "white",
        border: "2px solid #007bff",
        borderRadius: "8px",
        margin: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ color: "#007bff", marginBottom: "20px" }}>
        🎯 SWITCH PEQUENO - TESTE
      </h2>

      <div style={{ marginBottom: "15px" }}>
        <h4>Switch Pequeno (32x16px):</h4>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <SwitchPequeno checked={switch1} onChange={setSwitch1} />
          <span>Opção 1 - {switch1 ? "LIGADO" : "DESLIGADO"}</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <SwitchPequeno checked={switch2} onChange={setSwitch2} />
          <span>Opção 2 - {switch2 ? "LIGADO" : "DESLIGADO"}</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <SwitchPequeno checked={false} onChange={() => {}} disabled />
          <span style={{ color: "#666" }}>Opção desabilitada</span>
        </div>
      </div>

      <div
        style={{
          marginBottom: "15px",
          borderTop: "1px solid #eee",
          paddingTop: "15px",
        }}
      >
        <h4>Switch Mínimo (28x14px):</h4>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <SwitchMinimoBasico checked={switch3} onChange={setSwitch3} />
          <span>Mínimo 1 - {switch3 ? "LIGADO" : "DESLIGADO"}</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <SwitchMinimoBasico checked={switch4} onChange={setSwitch4} />
          <span>Mínimo 2 - {switch4 ? "LIGADO" : "DESLIGADO"}</span>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#d4edda",
          border: "1px solid #c3e6cb",
          borderRadius: "4px",
          padding: "10px",
          fontSize: "14px",
        }}
      >
        <strong>✅ TAMANHOS PEQUENOS:</strong>
        <br />
        • Switch Pequeno: 32x16px
        <br />
        • Switch Mínimo: 28x14px
        <br />
        • Bolinha: 12px e 10px respectivamente
        <br />
        • SEM frameworks - CSS inline puro
        <br />• Funciona 100% garantido
      </div>

      <button
        onClick={() => {
          setSwitch1(!switch1);
          setSwitch2(!switch2);
          setSwitch3(!switch3);
          setSwitch4(!switch4);
        }}
        style={{
          marginTop: "15px",
          padding: "8px 16px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Alternar Todos
      </button>
    </div>
  );
}
