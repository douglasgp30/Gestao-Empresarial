import React from 'react';
import { cn } from '../../lib/utils';

interface FormFieldRequiredProps {
  children: React.ReactElement;
  isRequired?: boolean;
  isEmpty?: boolean;
  errorMessage?: string;
}

export function FormFieldRequired({ 
  children, 
  isRequired = false, 
  isEmpty = false, 
  errorMessage 
}: FormFieldRequiredProps) {
  const shouldShowError = isRequired && isEmpty;
  
  return (
    <div className="space-y-1">
      {React.cloneElement(children, {
        className: cn(
          children.props.className,
          shouldShowError && "border-red-500 focus:border-red-500"
        )
      })}
      {shouldShowError && errorMessage && (
        <p className="text-xs text-red-500 mt-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
