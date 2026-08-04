import { Button } from "@atlas/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@atlas/ui/components/card";
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
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Log in to your Atlas account.</CardDescription>
      </CardHeader>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          onSubmit({
            email: String(form.get("email") ?? ""),
            password: String(form.get("password") ?? ""),
          });
        }}
      >
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
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
        </CardContent>
        <CardFooter className="mt-6 flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Logging in…" : "Log in"}
          </Button>
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            No account yet? Sign up
          </button>
        </CardFooter>
      </form>
    </Card>
  );
}
