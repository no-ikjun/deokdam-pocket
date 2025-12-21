"use client";

import React from "react";
import styles from "./LoadingButton.module.css";

type LoadingButtonProps = {
  label: string;
  onClick?: () => void | Promise<void>;
  type?: "button" | "submit" | "reset";

  loading?: boolean;
  disabled?: boolean;

  loadingLabel?: string;

  width?: number | string; // e.g. 240 | "100%"
  height?: number; // px
  fontSize?: string; // e.g. "0.95rem"

  className?: string;
  variant?: "red" | "blue" | "gray";
};

const DEFAULTS = {
  width: "auto",
  height: 50,
  fontSize: "0.95rem",
  loadingLabel: "로딩 중...",
  variant: "red" as const,
  type: "button" as const,
};

export function LoadingButton({
  label,
  onClick,
  type = DEFAULTS.type,

  loading = false,
  disabled = false,
  loadingLabel = DEFAULTS.loadingLabel,

  width = DEFAULTS.width,
  height = DEFAULTS.height,
  fontSize = DEFAULTS.fontSize,

  className,
  variant = DEFAULTS.variant,
}: LoadingButtonProps) {
  const isDisabled = disabled || loading;
  const showOnlySpinner = loading && loadingLabel === "";

  const styleVars = {
    ["--btn-width" as any]: typeof width === "number" ? `${width}px` : width,
    ["--btn-height" as any]: `${height}px`,
    ["--btn-font-size" as any]: fontSize,
  } as React.CSSProperties;

  return (
    <button
      type={type}
      className={[
        styles.btn,
        styles[`variant_${variant}`],
        isDisabled ? styles.disabled : "",
        className ?? "",
      ].join(" ")}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-busy={loading}
      aria-disabled={isDisabled}
      style={styleVars}
    >
      <span
        className={[
          styles.content,
          showOnlySpinner ? styles.spinnerOnly : "",
        ].join(" ")}
      >
        {loading ? (
          showOnlySpinner ? (
            <span className={styles.spinner} aria-hidden="true" />
          ) : (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              <span className={styles.text}>{loadingLabel}</span>
            </>
          )
        ) : (
          <span className={styles.text}>{label}</span>
        )}
      </span>
    </button>
  );
}
