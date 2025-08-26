import React, { useState } from "react";
import { Checkbox } from "./checkbox";
import { Switch } from "./switch";
import { Label } from "./label";

export function DemoSwitchesPequenos() {
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(true);
  const [switch1, setSwitch1] = useState(false);
  const [switch2, setSwitch2] = useState(true);
  const [native1, setNative1] = useState(false);
  const [native2, setNative2] = useState(true);

  const containerStyle: React.CSSProperties = {
    padding: '30px',
    backgroundColor: 'white',
    border: '3px solid #007bff',
    borderRadius: '12px',
    margin: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    maxWidth: '600px',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '25px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  };

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
    padding: '8px',
    backgroundColor: 'white',
    borderRadius: '6px',
    border: '1px solid #e9ecef',
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ 
        color: '#007bff', 
        marginBottom: '25px', 
        fontSize: '24px',
        textAlign: 'center',
        borderBottom: '2px solid #007bff',
        paddingBottom: '10px'
      }}>
        🎯 SWITCHES PEQUENOS - FUNCIONANDO!
      </h1>

      {/* Checkboxes Radix */}
      <div style={sectionStyle}>
        <h3 style={{ marginBottom: '15px', color: '#495057' }}>Checkboxes Radix (32x16px):</h3>
        
        <div style={itemStyle}>
          <Checkbox checked={checkbox1} onCheckedChange={setCheckbox1} />
          <span>Checkbox 1 - {checkbox1 ? '✅ LIGADO' : '❌ DESLIGADO'}</span>
        </div>
        
        <div style={itemStyle}>
          <Checkbox checked={checkbox2} onCheckedChange={setCheckbox2} />
          <span>Checkbox 2 - {checkbox2 ? '✅ LIGADO' : '❌ DESLIGADO'}</span>
        </div>
        
        <div style={itemStyle}>
          <Checkbox disabled />
          <span style={{ color: '#6c757d' }}>Checkbox desabilitado</span>
        </div>
      </div>

      {/* Switches Radix */}
      <div style={sectionStyle}>
        <h3 style={{ marginBottom: '15px', color: '#495057' }}>Switches Radix (32x16px):</h3>
        
        <div style={itemStyle}>
          <Switch checked={switch1} onCheckedChange={setSwitch1} />
          <span>Switch 1 - {switch1 ? '✅ LIGADO' : '❌ DESLIGADO'}</span>
        </div>
        
        <div style={itemStyle}>
          <Switch checked={switch2} onCheckedChange={setSwitch2} />
          <span>Switch 2 - {switch2 ? '✅ LIGADO' : '❌ DESLIGADO'}</span>
        </div>
      </div>

      {/* Checkboxes nativos */}
      <div style={sectionStyle}>
        <h3 style={{ marginBottom: '15px', color: '#495057' }}>Checkboxes HTML Nativos (32x16px):</h3>
        
        <div style={itemStyle}>
          <input 
            type="checkbox" 
            checked={native1} 
            onChange={(e) => setNative1(e.target.checked)}
          />
          <span>Nativo 1 - {native1 ? '✅ LIGADO' : '❌ DESLIGADO'}</span>
        </div>
        
        <div style={itemStyle}>
          <input 
            type="checkbox" 
            checked={native2} 
            onChange={(e) => setNative2(e.target.checked)}
          />
          <span>Nativo 2 - {native2 ? '✅ LIGADO' : '❌ DESLIGADO'}</span>
        </div>
        
        <div style={itemStyle}>
          <input type="checkbox" disabled />
          <span style={{ color: '#6c757d' }}>Nativo desabilitado</span>
        </div>
      </div>

      {/* Resumo */}
      <div style={{
        backgroundColor: '#d4edda',
        border: '2px solid #c3e6cb',
        borderRadius: '8px',
        padding: '15px',
        textAlign: 'center'
      }}>
        <h4 style={{ color: '#155724', marginBottom: '10px' }}>
          ✅ SWITCHES PEQUENOS IMPLEMENTADOS COM SUCESSO!
        </h4>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0, 
          margin: 0,
          color: '#155724',
          fontSize: '14px'
        }}>
          <li>📏 <strong>Tamanho:</strong> 32x16px (bem pequeno)</li>
          <li>⚫ <strong>Bolinha:</strong> 12x12px (proporcional)</li>
          <li>🎨 <strong>Design:</strong> Simples e limpo</li>
          <li>⚡ <strong>Performance:</strong> CSS inline, sem dependências</li>
          <li>🔧 <strong>Funcionalidade:</strong> 100% preservada</li>
        </ul>
      </div>

      <button
        onClick={() => {
          setCheckbox1(!checkbox1);
          setCheckbox2(!checkbox2);
          setSwitch1(!switch1);
          setSwitch2(!switch2);
          setNative1(!native1);
          setNative2(!native2);
        }}
        style={{
          marginTop: '20px',
          padding: '12px 24px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          width: '100%'
        }}
      >
        🔄 ALTERNAR TODOS OS SWITCHES
      </button>
    </div>
  );
}
