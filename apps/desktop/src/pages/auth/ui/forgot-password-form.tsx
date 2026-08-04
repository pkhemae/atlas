import { MailCheck } from "lucide-react";
import { Button } from "@atlas/ui/components/button";
import { Input } from "@atlas/ui/components/input";
import { Label } from "@atlas/ui/components/label";

export interface ForgotPasswordValues {
  email: string;
}

interface ForgotPasswordFormProps {
  pending: boolean;
  submitted: boolean;
  errorMessage: string | null;
  onSubmit: (values: ForgotPasswordValues) => void;
  onBackToLogin: () => void;
}

export function ForgotPasswordForm({
  pending,
  submitted,
  errorMessage,
  onSubmit,
  onBackToLogin,
}: ForgotPasswordFormProps) {
  if (submitted) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 flex w-full max-w-xs flex-col items-center gap-6 text-center duration-500">
        <div className="bg-secondary text-foreground flex size-12 items-center justify-center rounded-full">
          <MailCheck className="size-5" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            Check your inbox
          </h1>
          <p className="text-muted-foreground text-sm text-pretty">
            If an account exists for this email, you will receive a link to
            reset your password.
          </p>
        </div>
        <Button variant="secondary" onClick={onBackToLogin}>
          Back to login
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 flex w-full max-w-xs flex-col gap-8 duration-500">
      <header className="flex flex-col items-center gap-1.5 text-center">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
          Atlas
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Reset your password
        </h1>
        <p className="text-muted-foreground text-sm text-pretty">
          Enter your email and we will send you a reset link.
        </p>
      </header>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          onSubmit({ email: String(form.get("email") ?? "") });
        }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-muted-foreground text-xs">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
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
          {pending ? "Sending…" : "Send reset link"}
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
