"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/validation";
import { emptyActionState } from "@/lib/validation";
import { StatusMessage } from "./ui";

export function ActionForm({
  action,
  children,
  className,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, emptyActionState);

  return (
    <form action={formAction} className={className}>
      {children}
      <StatusMessage ok={state.ok} message={state.message} />
    </form>
  );
}
