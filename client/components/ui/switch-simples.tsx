import React from "react";

interface SwitchSimplesProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}

export function SwitchSimples({ checked, onChange, disabled = false, id }: SwitchSimplesProps) {
  return (
    <label 
      htmlFor={id}
      className={`
        inline-flex items-center cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <div 
        className={`
          relative w-10 h-5 rounded-full transition-colors duration-200 ease-in-out
          ${checked ? 'bg-blue-500' : 'bg-gray-300'}
          ${disabled ? '' : 'hover:shadow-md'}
        `}
      >
        <div 
          className={`
            absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out
            ${checked ? 'transform translate-x-5' : 'transform translate-x-0'}
          `}
        />
      </div>
    </label>
  );
}

// Versão ainda mais simples se a anterior não funcionar
export function SwitchMinimoSimples({ checked, onChange, disabled = false }: SwitchSimplesProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        relative inline-flex w-10 h-5 rounded-full transition-colors
        ${checked ? 'bg-blue-500' : 'bg-gray-300'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span 
        className={`
          inline-block w-4 h-4 transform bg-white rounded-full shadow transition-transform
          ${checked ? 'translate-x-5' : 'translate-x-0.5'}
          mt-0.5
        `}
      />
    </button>
  );
}
