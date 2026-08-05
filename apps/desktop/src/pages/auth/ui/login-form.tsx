import { useTranslation } from "react-i18next";
import { Button } from "@atlas/ui/components/button";
import { Input } from "@atlas/ui/components/input";
import { Label } from "@atlas/ui/components/label";
import { PasswordInput } from "@atlas/ui/components/password-input";

export interface LoginValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  pending: boolean;
  errorMessage: string | null;
  onSubmit: (values: LoginValues) => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
}

export function LoginForm({
  pending,
  errorMessage,
  onSubmit,
  onSwitchToSignup,
  onForgotPassword,
}: LoginFormProps) {
  const { t } = useTranslation();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 flex w-full max-w-xs flex-col gap-8 duration-500">
      <header className="flex flex-col items-center gap-1.5 text-center">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
          Atlas
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("auth.login.title")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("auth.login.subtitle")}
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
            {t("common.email")}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t("common.emailPlaceholder")}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-muted-foreground text-xs">
              {t("common.password")}
            </Label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-muted-foreground hover:text-foreground -my-2 py-2 text-xs transition-colors"
            >
              {t("auth.login.forgotPassword")}
            </button>
          </div>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            placeholder={t("auth.login.passwordPlaceholder")}
            showLabel={t("common.showPassword")}
            hideLabel={t("common.hidePassword")}
            required
          />
        </div>
        {errorMessage ? (
          <p className="text-destructive text-sm" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <Button type="submit" className="mt-2 w-full" disabled={pending}>
          {pending ? t("auth.login.submitting") : t("common.logIn")}
        </Button>
      </form>
      <button
        type="button"
        onClick={onSwitchToSignup}
        className="text-muted-foreground hover:text-foreground mx-auto -my-2 px-3 py-2 text-sm transition-colors"
      >
        {t("auth.login.switchToSignup")}
      </button>
    </div>
  );
}
