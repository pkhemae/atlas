import { Trans, useTranslation } from "react-i18next";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@atlas/ui/components/input-otp";

const CODE_LENGTH = 10;
// mirrors the API reset-token policy (30 min expiry)
const RESET_CODE_TTL_MINUTES = 30;
const HEX_PATTERN = "^[0-9a-fA-F]*$";

interface ResetCodeFormProps {
  email: string;
  code: string;
  pending: boolean;
  errorMessage: string | null;
  resendCooldown: number;
  resendPending: boolean;
  onCodeChange: (code: string) => void;
  onComplete: (code: string) => void;
  onResend: () => void;
  onBackToLogin: () => void;
}

export function ResetCodeForm({
  email,
  code,
  pending,
  errorMessage,
  resendCooldown,
  resendPending,
  onCodeChange,
  onComplete,
  onResend,
  onBackToLogin,
}: ResetCodeFormProps) {
  const { t } = useTranslation();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 flex w-full max-w-sm flex-col items-center gap-8 duration-500">
      <header className="flex flex-col items-center gap-1.5 text-center">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
          Atlas
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("auth.resetCode.title")}
        </h1>
        <p className="text-muted-foreground text-sm">
          <Trans
            i18nKey="auth.resetCode.sentTo"
            values={{ email }}
            components={{ 1: <span className="text-foreground" /> }}
          />
          <br />
          {t("auth.resetCode.expires", { count: RESET_CODE_TTL_MINUTES })}
        </p>
      </header>
      <div className="flex flex-col items-center gap-4">
        <InputOTP
          maxLength={CODE_LENGTH}
          pattern={HEX_PATTERN}
          // the lib defaults to inputMode="numeric", which makes WebKit lag
          // on letter keystrokes — our codes are alphanumeric hex
          inputMode="text"
          value={code}
          onChange={onCodeChange}
          onComplete={onComplete}
          disabled={pending}
          autoFocus
          containerClassName="justify-center"
          // the emailed code is formatted XXXXX-XXXXX: strip the dash (and
          // any stray whitespace) so pasting it fills the slots
          pasteTransformer={(pasted) => pasted.replace(/[^0-9a-fA-F]/g, "")}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} className="font-mono uppercase" />
            <InputOTPSlot index={1} className="font-mono uppercase" />
            <InputOTPSlot index={2} className="font-mono uppercase" />
            <InputOTPSlot index={3} className="font-mono uppercase" />
            <InputOTPSlot index={4} className="font-mono uppercase" />
          </InputOTPGroup>
          <InputOTPSeparator className="text-muted-foreground" />
          <InputOTPGroup>
            <InputOTPSlot index={5} className="font-mono uppercase" />
            <InputOTPSlot index={6} className="font-mono uppercase" />
            <InputOTPSlot index={7} className="font-mono uppercase" />
            <InputOTPSlot index={8} className="font-mono uppercase" />
            <InputOTPSlot index={9} className="font-mono uppercase" />
          </InputOTPGroup>
        </InputOTP>
        {/* fixed-height status slot so the layout never jumps */}
        <p
          className={
            errorMessage && !pending
              ? "text-destructive min-h-5 text-sm"
              : "text-muted-foreground min-h-5 animate-pulse text-sm"
          }
          role={errorMessage && !pending ? "alert" : undefined}
        >
          {pending ? t("auth.resetCode.checking") : (errorMessage ?? "")}
        </p>
      </div>
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={onResend}
          disabled={resendCooldown > 0 || resendPending}
          className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm tabular-nums transition-colors disabled:pointer-events-none disabled:opacity-50"
        >
          {resendPending
            ? t("auth.resetCode.resendSending")
            : resendCooldown > 0
              ? t("auth.resetCode.resendIn", { seconds: resendCooldown })
              : t("auth.resetCode.resend")}
        </button>
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm transition-colors"
        >
          {t("common.backToLogin")}
        </button>
      </div>
    </div>
  );
}
