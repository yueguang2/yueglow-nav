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
        "chip inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
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
        "focus-ring inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-[var(--accent)] text-[var(--accent-foreground)] hover:brightness-110",
        variant === "secondary" && "border border-[var(--line)] bg-[var(--control-bg)] text-[var(--foreground)] hover:bg-[var(--panel-strong)]",
        variant === "danger" && "border border-[color-mix(in_srgb,var(--danger)_28%,transparent)] bg-[var(--danger-soft)] text-[var(--danger)] hover:brightness-105",
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
        "focus-ring inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-200",
        variant === "primary" && "bg-[var(--accent)] text-[var(--accent-foreground)] hover:brightness-110",
        variant === "secondary" && "border border-[var(--line)] bg-[var(--control-bg)] text-[var(--foreground)] hover:bg-[var(--panel-strong)]",
        variant === "danger" && "border border-[color-mix(in_srgb,var(--danger)_28%,transparent)] bg-[var(--danger-soft)] text-[var(--danger)] hover:brightness-105",
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
        "focus-ring w-full rounded-2xl border border-[var(--line)] bg-[var(--field-bg)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/70 transition",
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
        "focus-ring min-h-24 w-full resize-y rounded-2xl border border-[var(--line)] bg-[var(--field-bg)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/70 transition",
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
        "focus-ring w-full rounded-2xl border border-[var(--line)] bg-[var(--field-bg)] px-4 py-3 text-sm text-[var(--foreground)] transition",
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
      <span className="text-sm font-medium text-[var(--soft-text)]">{label}</span>
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
    <label className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-3 text-sm text-[var(--soft-text)]">
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
    <p className={clsx("rounded-2xl border px-4 py-3 text-sm", ok ? "chip-success" : "chip-danger")}>
      {message}
    </p>
  );
}

export function InitialMark({ label, className }: { label: string; className?: string }) {
  const text = label.trim().slice(0, 2).toUpperCase() || "N";

  return (
    <span
      className={clsx(
        "grid size-11 shrink-0 place-items-center rounded-2xl border border-[var(--line)] bg-[var(--panel)] text-sm font-black tracking-tight text-[var(--foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]",
        className,
      )}
    >
      {text}
    </span>
  );
}
