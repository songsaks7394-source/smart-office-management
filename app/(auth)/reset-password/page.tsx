"use client";

import { useActionState, useEffect } from "react";
import { resetPasswordAction, type ActionResult } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";

const initialState: ActionResult = { success: false };

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);

  useEffect(() => {
    if (state.message && !state.success) toast.error(state.message);
  }, [state]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-secondary">Set a new password</h2>
        <p className="text-sm text-muted-foreground">Choose a strong password for your account</p>
      </div>

      <form action={formAction} className="space-y-4">
        <FormField label="New password" htmlFor="password" error={state.errors?.password} required>
          <Input id="password" name="password" type="password" placeholder="••••••••" autoComplete="new-password" />
        </FormField>
        <FormField label="Confirm new password" htmlFor="confirmPassword" error={state.errors?.confirmPassword} required>
          <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" autoComplete="new-password" />
        </FormField>
        <Button type="submit" className="w-full" loading={isPending}>
          Update password
        </Button>
      </form>
    </div>
  );
}
