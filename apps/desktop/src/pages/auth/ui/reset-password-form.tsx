import { Button } from "@atlas/ui/components/button";
import { Label } from "@atlas/ui/components/label";
import { PasswordInput } from "@atlas/ui/components/password-input";

export interface NewPasswordValues {
  password: string;
  passwordConfirmation: string;
}

interface ResetPasswordFormProps {
  pending: boolean;
  errorMessage: string | null;
  onSubmit: (values: NewPasswordValues) => void;
  onBackToLogin: () => void;
}

export function ResetPasswordForm({
  pending,
  errorMessage,
  onSubmit,
  onBackToLogin,
}: ResetPasswordFormProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 flex w-full max-w-xs flex-col gap-8 duration-500">
      <header className="flex flex-col items-center gap-1.5 text-center">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
          Atlas
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Choose a new password
        </h1>
        <p className="text-muted-foreground text-sm text-pretty">
          Code verified. Pick a new password for your account.
        </p>
      </header>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          onSubmit({
            password: String(form.get("password") ?? ""),
            passwordConfirmation: String(
              form.get("passwordConfirmation") ?? "",
            ),
          });
        }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="text-muted-foreground text-xs">
            New password
          </Label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            placeholder="8+ characters"
            autoFocus
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="passwordConfirmation"
            className="text-muted-foreground text-xs"
          >
            Confirm new password
          </Label>
          <PasswordInput
            id="passwordConfirmation"
            name="passwordConfirmation"
            autoComplete="new-password"
            placeholder="Repeat your password"
            required
          />
        </div>
        {errorMessage ? (
          <p className="text-destructive text-sm" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <Button type="submit" className="mt-2 w-full" disabled={pending}>
          {pending ? "Resetting…" : "Reset password"}
        </Button>
      </form>
      <button
        type="button"
        onClick={onBackToLogin}
        className="text-muted-foreground hover:text-foreground mx-auto -my-2 px-3 py-2 text-sm transition-colors"
      >
        Back to login
      </button>
    </div>
  );
}
