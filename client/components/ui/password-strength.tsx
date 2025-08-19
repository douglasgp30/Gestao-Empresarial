import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface PasswordCriteria {
  label: string;
  test: (password: string) => boolean;
  weight: number;
}

const criterios: PasswordCriteria[] = [
  {
    label: 'Pelo menos 6 caracteres',
    test: (password) => password.length >= 6,
    weight: 1
  }
];

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const criteriosAtendidos = criterios.filter(criterio => criterio.test(password));
  const pontuacao = criteriosAtendidos.reduce((total, criterio) => total + criterio.weight, 0);
  const pontuacaoMaxima = criterios.reduce((total, criterio) => total + criterio.weight, 0);
  
  const porcentagem = Math.round((pontuacao / pontuacaoMaxima) * 100);
  
  const getNivelForca = () => {
    if (password.length >= 6) return { nivel: 'Válida', cor: 'bg-green-500', texto: 'text-green-700' };
    return { nivel: 'Muito curta', cor: 'bg-red-500', texto: 'text-red-700' };
  };

  const { nivel, cor, texto } = getNivelForca();

  // Não mostrar nada se a senha estiver vazia
  if (!password) return null;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Barra de força */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Força da senha</span>
          <span className={cn('text-sm font-medium', texto)}>{nivel}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={cn('h-2 rounded-full transition-all duration-300', cor)}
            style={{ width: `${porcentagem}%` }}
          />
        </div>
      </div>

      {/* Lista de critérios */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-700">Requisitos:</p>
        {criterios.map((criterio, index) => {
          const atendido = criterio.test(password);
          return (
            <div key={index} className="flex items-center space-x-2">
              <div className={cn(
                'flex items-center justify-center w-4 h-4 rounded-full',
                atendido ? 'bg-green-100' : 'bg-gray-100'
              )}>
                {atendido ? (
                  <Check className="w-2.5 h-2.5 text-green-600" />
                ) : (
                  <X className="w-2.5 h-2.5 text-gray-400" />
                )}
              </div>
              <span className={cn(
                'text-sm',
                atendido ? 'text-green-700' : 'text-gray-500'
              )}>
                {criterio.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function validarForcaSenha(password: string): { valida: boolean; pontuacao: number } {
  if (!password) return { valida: false, pontuacao: 0 };

  // Validação simples: apenas 6 caracteres ou mais
  const valida = password.length >= 6;
  const pontuacao = valida ? 100 : 0;

  return { valida, pontuacao };
}
