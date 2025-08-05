import React from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { Wrench } from 'lucide-react';

interface EmpresaLogoProps {
  showSubtitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'sidebar' | 'login';
}

export default function EmpresaLogo({ 
  showSubtitle = true, 
  size = 'md',
  variant = 'default' 
}: EmpresaLogoProps) {
  const { empresaConfig } = useConfig();

  const sizeClasses = {
    sm: {
      icon: 'h-4 w-4',
      iconContainer: 'p-1',
      title: 'text-sm font-semibold',
      subtitle: 'text-xs'
    },
    md: {
      icon: 'h-5 w-5',
      iconContainer: 'p-2',
      title: 'text-base font-bold',
      subtitle: 'text-sm'
    },
    lg: {
      icon: 'h-8 w-8',
      iconContainer: 'p-3',
      title: 'text-2xl font-bold',
      subtitle: 'text-base'
    }
  };

  const variantClasses = {
    default: {
      iconContainer: 'bg-primary',
      icon: 'text-primary-foreground',
      title: 'text-foreground',
      subtitle: 'text-muted-foreground'
    },
    sidebar: {
      iconContainer: 'bg-sidebar-primary',
      icon: 'text-sidebar-primary-foreground',
      title: 'text-sidebar-foreground',
      subtitle: 'text-sidebar-foreground/70'
    },
    login: {
      iconContainer: 'bg-primary',
      icon: 'text-primary-foreground',
      title: 'text-foreground',
      subtitle: 'text-muted-foreground'
    }
  };

  const currentSize = sizeClasses[size];
  const currentVariant = variantClasses[variant];

  return (
    <div className="flex items-center space-x-2">
      <div className={`${currentVariant.iconContainer} ${currentSize.iconContainer} rounded-lg flex-shrink-0`}>
        {empresaConfig.logoUrl ? (
          <img 
            src={empresaConfig.logoUrl} 
            alt="Logo"
            className={`${currentSize.icon} object-contain`}
          />
        ) : (
          <Wrench className={`${currentSize.icon} ${currentVariant.icon}`} />
        )}
      </div>
      <div className="min-w-0">
        <h1 className={`${currentSize.title} ${currentVariant.title} truncate`}>
          {empresaConfig.nomeEmpresa}
        </h1>
        {showSubtitle && empresaConfig.subtituloEmpresa && (
          <p className={`${currentSize.subtitle} ${currentVariant.subtitle} truncate`}>
            {empresaConfig.subtituloEmpresa}
          </p>
        )}
      </div>
    </div>
  );
}
