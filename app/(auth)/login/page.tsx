"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type ActionResult } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";
import { useEffect } from "react";

const initialState: ActionResult = { success: false };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state.message && !state.success) toast.error(state.message);
  }, [state]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-secondary">Welcome back</h2>
        <p className="text-sm text-muted-foreground">Sign in to your Smart Office account</p>
      </div>

      <form action={formAction} className="space-y-4">
        <FormField label="Email" htmlFor="email" error={state.errors?.email} required>
          <Input id="email" name="email" type="email" placeholder="you@company.com" autoComplete="email" />
        </FormField>
        <FormField label="Password" htmlFor="password" error={state.errors?.password} required>
          <Input id="password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" />
        </FormField>
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" loading={isPending}>
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary font-medium hover:underline">
          Create one
        </Link>
      </p>

      <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
        <p className="font-medium mb-1">Demo accounts</p>
        <p>admin@smartoffice.com / Admin123!</p>
        <p>employee1@smartoffice.com / Employee123!</p>
      </div>
    </div>
  );
}
