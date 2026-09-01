"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-[13px] font-medium text-no">
      {message}
    </p>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export function Field({
  id,
  label,
  hint,
  error,
  containerClassName,
  className,
  ...props
}: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("min-w-0", containerClassName)}>
      <Label htmlFor={id} className="mb-1.5">
        {label}
      </Label>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(errorId, hintId) || undefined}
        className={className}
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-[13px] font-medium text-mute">
          {hint}
        </p>
      )}
      <FieldError id={errorId ?? `${id}-error`} message={error} />
    </div>
  );
}

interface MaskedFieldProps extends FieldProps {
  /** Rendered in place of the value while the field is hidden and unfocused. */
  maskedValue: string;
}

/**
 * Sensitive fields (SSN, card number) render masked until the renter chooses to
 * reveal them, and re-mask as soon as focus leaves.
 */
export function MaskedField({
  id,
  label,
  hint,
  error,
  maskedValue,
  containerClassName,
  value,
  onFocus,
  onBlur,
  ...props
}: MaskedFieldProps) {
  const [revealed, setRevealed] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const stringValue = typeof value === "string" ? value : "";
  const showRaw = revealed || focused || !stringValue;

  return (
    <div className={cn("min-w-0", containerClassName)}>
      <Label htmlFor={id} className="mb-1.5">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          value={showRaw ? stringValue : maskedValue}
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(errorId, hintId) || undefined}
          className="pr-12"
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setRevealed((current) => !current)}
          aria-pressed={revealed}
          aria-label={revealed ? `Hide ${label}` : `Show ${label}`}
          className="absolute inset-y-0 right-0 flex h-11 w-11 items-center justify-center rounded-r-btn text-mute hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-[13px] font-medium text-mute">
          {hint}
        </p>
      )}
      <FieldError id={errorId ?? `${id}-error`} message={error} />
    </div>
  );
}

export function Checkbox({
  id,
  checked,
  onChange,
  children,
  error,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
  error?: string;
}) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div>
      {/* 44px row so the whole label is a comfortable tap target */}
      <label
        htmlFor={id}
        className="flex min-h-[44px] cursor-pointer items-start gap-3 py-2 text-[14px] font-medium leading-5 tracking-[-0.14px] text-ink-2"
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          aria-describedby={errorId}
          aria-invalid={error ? true : undefined}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded-[6px] border border-line-2 accent-fill transition-[border-color] duration-240 ease-premium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        />
        <span>{children}</span>
      </label>
      <FieldError id={errorId ?? `${id}-error`} message={error} />
    </div>
  );
}
