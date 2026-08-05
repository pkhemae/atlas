import { CircleCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@atlas/ui/components/button";

interface ResetSuccessProps {
  onBackToLogin: () => void;
}

export function ResetSuccess({ onBackToLogin }: ResetSuccessProps) {
  const { t } = useTranslation();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 flex w-full max-w-xs flex-col items-center gap-6 text-center duration-500">
      <div className="bg-secondary text-foreground flex size-12 items-center justify-center rounded-full">
        <CircleCheck className="size-5" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("auth.resetSuccess.title")}
        </h1>
        <p className="text-muted-foreground text-sm text-pretty">
          {t("auth.resetSuccess.body")}
        </p>
      </div>
      <Button onClick={onBackToLogin}>{t("common.logIn")}</Button>
    </div>
  );
}
