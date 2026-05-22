"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./ui";

export function SubmitButton({
  children,
  pendingText = "处理中...",
  variant = "primary",
  className,
}: {
  children: React.ReactNode;
  pendingText?: string;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} variant={variant} className={className}>
      {pending ? pendingText : children}
    </Button>
  );
}
