/**
 * Utilitários de validação para formulários do sistema
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Valida se um valor numérico é positivo
 */
export function validatePositiveNumber(value: string | number, fieldName: string): ValidationError | null {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue) || numValue <= 0) {
    return {
      field: fieldName,
      message: `${fieldName} deve ser um número maior que zero`
    };
  }
  
  return null;
}

/**
 * Valida se um campo obrigatório está preenchido
 */
export function validateRequired(value: string | null | undefined, fieldName: string): ValidationError | null {
  if (!value || value.trim() === '') {
    return {
      field: fieldName,
      message: `${fieldName} é obrigatório`
    };
  }
  
  return null;
}

/**
 * Valida telefone com 4 dígitos
 */
export function validatePhoneDigits(value: string, fieldName: string): ValidationError | null {
  if (!/^\d{4}$/.test(value)) {
    return {
      field: fieldName,
      message: `${fieldName} deve conter exatamente 4 dígitos`
    };
  }
  
  return null;
}

/**
 * Valida email básico
 */
export function validateEmail(value: string, fieldName: string): ValidationError | null {
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return {
      field: fieldName,
      message: `${fieldName} deve ter um formato válido`
    };
  }
  
  return null;
}

/**
 * Valida CPF básico (apenas formato)
 */
export function validateCPF(value: string, fieldName: string): ValidationError | null {
  if (value && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value)) {
    return {
      field: fieldName,
      message: `${fieldName} deve estar no formato XXX.XXX.XXX-XX`
    };
  }
  
  return null;
}

/**
 * Valida data não pode ser no passado
 */
export function validateFutureDate(value: string | Date, fieldName: string): ValidationError | null {
  const date = typeof value === 'string' ? new Date(value) : value;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (date < today) {
    return {
      field: fieldName,
      message: `${fieldName} não pode ser no passado`
    };
  }
  
  return null;
}

/**
 * Executa múltiplas validações e retorna o resultado consolidado
 */
export function validateFields(validators: (() => ValidationError | null)[]): ValidationResult {
  const errors: ValidationError[] = [];
  
  validators.forEach(validator => {
    const error = validator();
    if (error) {
      errors.push(error);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Formata erros de validação para exibição em toast
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map(error => error.message).join('. ');
}

/**
 * Validações específicas para lançamentos de caixa
 */
export function validateLancamentoCaixa(data: {
  valor: string;
  descricao: string;
  formaPagamento: string;
  conta: string;
  valorRecebido?: string;
  isCartao?: boolean;
}): ValidationResult {
  return validateFields([
    () => validatePositiveNumber(data.valor, 'Valor'),
    () => validateRequired(data.descricao, 'Descrição'),
    () => validateRequired(data.formaPagamento, 'Forma de pagamento'),
    () => validateRequired(data.conta, 'Conta'),
    () => {
      if (data.isCartao && (!data.valorRecebido || parseFloat(data.valorRecebido) <= 0)) {
        return {
          field: 'valorRecebido',
          message: 'Valor recebido é obrigatório e deve ser maior que zero para pagamentos no cartão'
        };
      }
      return null;
    }
  ]);
}

/**
 * Validações específicas para agendamentos
 */
export function validateAgendamento(data: {
  dataServico: string;
  horaServico: string;
  descricaoServico: string;
  setor: string;
  cidade: string;
  finalTelefoneCliente: string;
}): ValidationResult {
  return validateFields([
    () => validateRequired(data.dataServico, 'Data do serviço'),
    () => validateFutureDate(data.dataServico, 'Data do serviço'),
    () => validateRequired(data.horaServico, 'Hora do serviço'),
    () => validateRequired(data.descricaoServico, 'Descrição do serviço'),
    () => validateRequired(data.setor, 'Setor'),
    () => validateRequired(data.cidade, 'Cidade'),
    () => validateRequired(data.finalTelefoneCliente, 'Final do telefone'),
    () => validatePhoneDigits(data.finalTelefoneCliente, 'Final do telefone')
  ]);
}
