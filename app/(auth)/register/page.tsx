"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { registerAction, type ActionResult } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";

const initialState: ActionResult = { success: false };

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  useEffect(() => {
    if (state.message) {
      state.success ? toast.success(state.message) : toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-secondary">Create your account</h2>
        <p className="text-sm text-muted-foreground">Join your office workspace</p>
      </div>

      <form action={formAction} className="space-y-4">
        <FormField label="Full name" htmlFor="fullName" error={state.errors?.fullName} required>
          <Input id="fullName" name="fullName" placeholder="Jane Doe" autoComplete="name" />
        </FormField>
        <FormField label="Email" htmlFor="email" error={state.errors?.email} required>
          <Input id="email" name="email" type="email" placeholder="you@company.com" autoComplete="email" />
        </FormField>
        <FormField label="Department" htmlFor="department">
          <Input id="department" name="department" placeholder="e.g. Marketing" />
        </FormField>
        <FormField label="Password" htmlFor="password" error={state.errors?.password} required>
          <Input id="password" name="password" type="password" placeholder="••••••••" autoComplete="new-password" />
        </FormField>
        <FormField label="Confirm password" htmlFor="confirmPassword" error={state.errors?.confirmPassword} required>
          <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" autoComplete="new-password" />
        </FormField>
        <Button type="submit" className="w-full" loading={isPending}>
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
