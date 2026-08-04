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

export interface SignupValues {
  fullName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

interface SignupFormProps {
  pending: boolean;
  errorMessage: string | null;
  onSubmit: (values: SignupValues) => void;
  onSwitchToLogin: () => void;
}

export function SignupForm({
  pending,
  errorMessage,
  onSubmit,
  onSwitchToLogin,
}: SignupFormProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Start focusing with Atlas.</CardDescription>
      </CardHeader>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          onSubmit({
            fullName: String(form.get("fullName") ?? ""),
            email: String(form.get("email") ?? ""),
            password: String(form.get("password") ?? ""),
            passwordConfirmation: String(
              form.get("passwordConfirmation") ?? "",
            ),
          });
        }}
      >
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" autoComplete="name" />
          </div>
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
              autoComplete="new-password"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="passwordConfirmation">Confirm password</Label>
            <Input
              id="passwordConfirmation"
              name="passwordConfirmation"
              type="password"
              autoComplete="new-password"
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
            {pending ? "Creating account…" : "Sign up"}
          </Button>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Already have an account? Log in
          </button>
        </CardFooter>
      </form>
    </Card>
  );
}
