import { Button } from "@atlas/ui/components/button";
import { Input } from "@atlas/ui/components/input";
import { Label } from "@atlas/ui/components/label";

export interface LoginValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  pending: boolean;
  errorMessage: string | null;
  onSubmit: (values: LoginValues) => void;
  onSwitchToSignup: () => void;
}

export function LoginForm({
  pending,
  errorMessage,
  onSubmit,
  onSwitchToSignup,
}: LoginFormProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 flex w-full max-w-xs flex-col gap-8 duration-500">
      <header className="flex flex-col items-center gap-1.5 text-center">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
          Atlas
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground text-sm">
          Log in to continue your focus.
        </p>
      </header>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          onSubmit({
            email: String(form.get("email") ?? ""),
            password: String(form.get("password") ?? ""),
          });
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
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="text-muted-foreground text-xs">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
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
          {pending ? "Logging in…" : "Log in"}
        </Button>
      </form>
      <button
        type="button"
        onClick={onSwitchToSignup}
        className="text-muted-foreground hover:text-foreground mx-auto text-sm transition-colors"
      >
        No account yet? Sign up
      </button>
    </div>
  );
}
