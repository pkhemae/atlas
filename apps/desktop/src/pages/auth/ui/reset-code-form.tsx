import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@atlas/ui/components/input-otp";

const CODE_LENGTH = 10;
const HEX_PATTERN = "^[0-9a-fA-F]*$";

interface ResetCodeFormProps {
  email: string;
  code: string;
  pending: boolean;
  errorMessage: string | null;
  resendDisabled: boolean;
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
  resendDisabled,
  onCodeChange,
  onComplete,
  onResend,
  onBackToLogin,
}: ResetCodeFormProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 flex w-full max-w-sm flex-col items-center gap-8 duration-500">
      <header className="flex flex-col items-center gap-1.5 text-center">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
          Atlas
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Enter your code
        </h1>
        <p className="text-muted-foreground text-sm text-pretty">
          We sent a reset code to{" "}
          <span className="text-foreground">{email}</span>. It expires in 30
          minutes.
        </p>
      </header>
      <div className="flex flex-col items-center gap-4">
        <InputOTP
          maxLength={CODE_LENGTH}
          pattern={HEX_PATTERN}
          value={code}
          onChange={onCodeChange}
          onComplete={onComplete}
          disabled={pending}
          autoFocus
          containerClassName="justify-center"
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
        <p
          className={
            pending
              ? "text-muted-foreground animate-pulse text-sm"
              : errorMessage
                ? "text-destructive text-sm"
                : "text-muted-foreground text-sm"
          }
          role={errorMessage ? "alert" : undefined}
        >
          {pending
            ? "Checking your code…"
            : (errorMessage ??
              "The code verifies automatically once complete.")}
        </p>
      </div>
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
