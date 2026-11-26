"use client";

import { useActionState, useEffect } from "react";
import { updateProfileAction } from "@/actions/auth";
import type { ActionResult } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";
import type { User } from "@/types/database";

const initialState: ActionResult = { success: false };

export function ProfileForm({ user }: { user: User }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  useEffect(() => {
    if (state.message) {
      state.success ? toast.success(state.message) : toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <FormField label="Full name" htmlFor="fullName" error={state.errors?.fullName} required>
        <Input id="fullName" name="fullName" defaultValue={user.full_name} />
      </FormField>

      <FormField label="Email" htmlFor="email">
        <Input id="email" defaultValue={user.email} disabled />
      </FormField>

      <FormField label="Department" htmlFor="department">
        <Input id="department" name="department" defaultValue={user.department ?? ""} />
      </FormField>

      <FormField label="Phone" htmlFor="phone">
        <Input id="phone" name="phone" defaultValue={user.phone ?? ""} placeholder="+1 (555) 000-0000" />
      </FormField>

      <Button type="submit" loading={isPending}>
        Save changes
      </Button>
    </form>
  );
}
