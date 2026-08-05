import { useTranslation } from "react-i18next";
import { Button } from "@atlas/ui/components/button";
import { Input } from "@atlas/ui/components/input";
import { Label } from "@atlas/ui/components/label";
import { PasswordInput } from "@atlas/ui/components/password-input";

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
  const { t } = useTranslation();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 flex w-full max-w-xs flex-col gap-8 duration-500">
      <header className="flex flex-col items-center gap-1.5 text-center">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
          Atlas
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("auth.signup.title")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("auth.signup.subtitle")}
        </p>
      </header>
      <form
        className="flex flex-col gap-4"
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
        <div className="flex flex-col gap-2">
          <Label htmlFor="fullName" className="text-muted-foreground text-xs">
            {t("auth.signup.fullName")}
          </Label>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder={t("auth.signup.fullNamePlaceholder")}
          />
        </div>
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
          <Label htmlFor="password" className="text-muted-foreground text-xs">
            {t("common.password")}
          </Label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            placeholder={t("auth.signup.passwordPlaceholder")}
            showLabel={t("common.showPassword")}
            hideLabel={t("common.hidePassword")}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="passwordConfirmation"
            className="text-muted-foreground text-xs"
          >
            {t("auth.signup.confirmPassword")}
          </Label>
          <PasswordInput
            id="passwordConfirmation"
            name="passwordConfirmation"
            autoComplete="new-password"
            placeholder={t("auth.signup.confirmPasswordPlaceholder")}
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
          {pending ? t("auth.signup.submitting") : t("auth.signup.submit")}
        </Button>
      </form>
      <button
        type="button"
        onClick={onSwitchToLogin}
        className="text-muted-foreground hover:text-foreground mx-auto -my-2 px-3 py-2 text-sm transition-colors"
      >
        {t("auth.signup.switchToLogin")}
      </button>
    </div>
  );
}
