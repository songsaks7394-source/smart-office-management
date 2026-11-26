"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { forgotPasswordAction, type ActionResult } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const initialState: ActionResult = { success: false };

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialState);

  useEffect(() => {
    if (state.message) {
      state.success ? toast.success(state.message) : toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="space-y-6">
      <Link href="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to login
      </Link>
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-secondary">Reset your password</h2>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <FormField label="Email" htmlFor="email" error={state.errors?.email} required>
          <Input id="email" name="email" type="email" placeholder="you@company.com" autoComplete="email" />
        </FormField>
        <Button type="submit" className="w-full" loading={isPending}>
          Send reset link
        </Button>
      </form>
    </div>
  );
}
