import { Button } from "@atlas/ui/components/button";
import { Input } from "@atlas/ui/components/input";
import { Label } from "@atlas/ui/components/label";
import { PasswordInput } from "@atlas/ui/components/password-input";

export interface ResetPasswordValues {
  code: string;
  password: string;
  passwordConfirmation: string;
}

interface ResetPasswordFormProps {
  email: string;
  pending: boolean;
  errorMessage: string | null;
  resendDisabled: boolean;
  onSubmit: (values: ResetPasswordValues) => void;
  onResend: () => void;
  onBackToLogin: () => void;
}

export function ResetPasswordForm({
  email,
  pending,
  errorMessage,
  resendDisabled,
  onSubmit,
  onResend,
  onBackToLogin,
}: ResetPasswordFormProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 flex w-full max-w-xs flex-col gap-8 duration-500">
      <header className="flex flex-col items-center gap-1.5 text-center">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
          Atlas
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Check your inbox
        </h1>
        <p className="text-muted-foreground text-sm text-pretty">
          We sent a reset code to{" "}
          <span className="text-foreground">{email}</span>. It expires in 30
          minutes.
        </p>
      </header>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          onSubmit({
            code: String(form.get("code") ?? ""),
            password: String(form.get("password") ?? ""),
            passwordConfirmation: String(
              form.get("passwordConfirmation") ?? "",
            ),
          });
        }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="code" className="text-muted-foreground text-xs">
            Reset code
          </Label>
          <Input
            id="code"
            name="code"
            autoComplete="one-time-code"
            placeholder="XXXXX-XXXXX"
            maxLength={11}
            className="text-center font-mono text-base tracking-[0.2em] uppercase placeholder:tracking-normal"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="text-muted-foreground text-xs">
            New password
          </Label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            placeholder="8+ characters"
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
        <Button
          variant="relief"
          type="submit"
          className="mt-2 w-full"
          disabled={pending}
        >
          {pending ? "Resetting…" : "Reset password"}
        </Button>
      </form>
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={onResend}
          disabled={resendDisabled}
          className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm transition-colors disabled:pointer-events-none disabled:opacity-50"
        >
          {resendDisabled ? "Code sent — wait a moment" : "Resend code"}
        </button>
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm transition-colors"
        >
          Back to login
        </button>
      </div>
    </div>
  );
}
