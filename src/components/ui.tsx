import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "chip inline-flex items-center px-2.5 py-1 text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "danger";
}) {
  return (
    <button
      className={clsx(
        "focus-ring inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "clay-button",
        variant === "secondary" && "border border-[var(--line)] bg-[var(--control-bg)] text-secondary hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]",
        variant === "danger" && "border border-[color-mix(in_srgb,var(--danger)_22%,transparent)] bg-[var(--danger-soft)] text-[var(--danger)] hover:brightness-105",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  className,
  variant = "primary",
  ...props
}: ComponentProps<"a"> & {
  variant?: "primary" | "secondary" | "danger";
}) {
  return (
    <a
      className={clsx(
        "focus-ring inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-200",
        variant === "primary" && "clay-button",
        variant === "secondary" && "border border-[var(--line)] bg-[var(--control-bg)] text-secondary hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]",
        variant === "danger" && "border border-[color-mix(in_srgb,var(--danger)_22%,transparent)] bg-[var(--danger-soft)] text-[var(--danger)] hover:brightness-105",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

export function TextInput(props: ComponentProps<"input">) {
  return (
    <input
      {...props}
      className={clsx(
        "clay-input w-full text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/70",
        props.className,
      )}
    />
  );
}

export function Textarea(props: ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={clsx(
        "clay-input min-h-24 w-full resize-y text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/70",
        props.className,
      )}
    />
  );
}

export function Select(props: ComponentProps<"select">) {
  return (
    <select
      {...props}
      className={clsx(
        "clay-input w-full text-sm text-[var(--foreground)]",
        props.className,
      )}
    />
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-secondary">{label}</span>
      {children}
      {hint ? <span className="text-xs text-[var(--muted)]">{hint}</span> : null}
    </label>
  );
}

export function Checkbox({
  label,
  ...props
}: ComponentProps<"input"> & {
  label: string;
}) {
  return (
    <label className="flex min-h-11 items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-3 text-sm text-secondary transition-colors duration-200 hover:bg-[var(--panel-strong)]">
      <input type="checkbox" className="size-4 accent-[var(--accent)]" {...props} />
      {label}
    </label>
  );
}

export function StatusMessage({ ok, message }: { ok: boolean; message: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className={clsx("rounded-xl px-4 py-3 text-sm", ok ? "chip-success" : "chip-danger")}>
      {message}
    </p>
  );
}

export function InitialMark({ label, className }: { label: string; className?: string }) {
  const text = label.trim().slice(0, 2).toUpperCase() || "N";

  return (
    <span
      className={clsx(
        "grid size-11 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-[var(--field-bg)] text-sm font-semibold tracking-tight text-[var(--foreground)]",
        className,
      )}
    >
      {text}
    </span>
  );
}
