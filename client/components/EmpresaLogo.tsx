import React from "react";
import { useConfig } from "../contexts/ConfigContext";
import { Wrench } from "lucide-react";

interface EmpresaLogoProps {
  showSubtitle?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "sidebar" | "login";
}

export default function EmpresaLogo({
  showSubtitle = true,
  size = "md",
  variant = "default",
}: EmpresaLogoProps) {
  const { empresaConfig } = useConfig();

  const sizeClasses = {
    sm: {
      icon: "h-4 w-4",
      iconContainer: "p-1",
      title: "text-sm font-semibold",
      subtitle: "text-xs",
    },
    md: {
      icon: "h-5 w-5",
      iconContainer: "p-2",
      title: "text-base font-bold",
      subtitle: "text-sm",
    },
    lg: {
      icon: "h-8 w-8",
      iconContainer: "p-3",
      title: "text-2xl font-bold",
      subtitle: "text-base",
    },
  };

  const variantClasses = {
    default: {
      iconContainer: "bg-primary",
      icon: "text-primary-foreground",
      title: "text-foreground",
      subtitle: "text-muted-foreground",
    },
    sidebar: {
      iconContainer: "bg-sidebar-primary",
      icon: "text-sidebar-primary-foreground",
      title: "text-sidebar-foreground",
      subtitle: "text-sidebar-foreground/70",
    },
    login: {
      iconContainer: "bg-primary",
      icon: "text-primary-foreground",
      title: "text-foreground",
      subtitle: "text-muted-foreground",
    },
  };

  const currentSize = sizeClasses[size];
  const currentVariant = variantClasses[variant];

  return (
    <div className="flex items-center justify-start gap-2 w-full min-w-0">
      <div
        className={`flex-shrink-0 flex items-center justify-center bg-transparent p-0 m-0`}
        style={{ minWidth: 0, minHeight: 0, width: size === "lg" ? "112px" : size === "md" ? "48px" : "32px", height: size === "lg" ? "112px" : size === "md" ? "48px" : "32px" }}
      >
        {empresaConfig.logoUrl ? (
          <img
            src={empresaConfig.logoUrl}
            alt="Logo"
            className="w-full h-full object-contain"
            style={{ background: "transparent", borderRadius: 0, boxShadow: "none" }}
          />
        ) : (
          <Wrench className={`${currentSize.icon} ${currentVariant.icon}`} />
        )}
      </div>
      <div className="min-w-0 flex flex-col justify-center max-w-full">
        <h1 className={`${currentSize.title} ${currentVariant.title} whitespace-nowrap`} style={{maxWidth: '100%'}}>{empresaConfig.nomeEmpresa}</h1>
        {showSubtitle && empresaConfig.subtituloEmpresa && (
          <p className={`${currentSize.subtitle} ${currentVariant.subtitle} truncate`}>{empresaConfig.subtituloEmpresa}</p>
        )}
      </div>
    </div>
  );
}
