import * as React from "react";

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  defaultChecked?: boolean;
}

const Switch = React.forwardRef<HTMLDivElement, SwitchProps>(
  (
    {
      checked,
      onCheckedChange,
      disabled = false,
      className = "",
      id,
      defaultChecked,
      ...props
    },
    ref,
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(
      defaultChecked || false,
    );

    // Se é controlado (tem checked prop), usa o valor externo, senão usa interno
    const isChecked = checked !== undefined ? checked : internalChecked;

    const handleChange = (newChecked: boolean) => {
      if (checked === undefined) {
        setInternalChecked(newChecked);
      }
      onCheckedChange?.(newChecked);
    };

    const handleClick = () => {
      if (!disabled) {
        handleChange(!isChecked);
      }
    };

    return (
      <div
        ref={ref}
        id={id}
        onClick={handleClick}
        className={className}
        style={{
          width: "32px",
          height: "16px",
          backgroundColor: isChecked ? "#007bff" : "#d1d5db",
          borderRadius: "16px",
          position: "relative",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "background-color 0.2s",
          opacity: disabled ? 0.5 : 1,
          marginRight: "8px",
          display: "inline-block",
        }}
        {...props}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            backgroundColor: "white",
            borderRadius: "50%",
            position: "absolute",
            top: "2px",
            left: isChecked ? "18px" : "2px",
            transition: "left 0.2s",
            boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
          }}
        />
      </div>
    );
  },
);

Switch.displayName = "Switch";

export { Switch };
