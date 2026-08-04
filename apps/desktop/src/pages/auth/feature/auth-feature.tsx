import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Screen } from "@/components/screen";
import { api, setAuthToken, type AuthUser } from "@/lib/api";
import { extractApiErrorMessage } from "@/lib/api-errors";
import { saveAuthToken } from "@/lib/secure-storage";
import {
  ForgotPasswordForm,
  type ForgotPasswordValues,
} from "@/pages/auth/ui/forgot-password-form";
import { LoginForm, type LoginValues } from "@/pages/auth/ui/login-form";
import {
  ResetPasswordForm,
  type ResetPasswordValues,
} from "@/pages/auth/ui/reset-password-form";
import { ResetSuccess } from "@/pages/auth/ui/reset-success";
import { SignupForm, type SignupValues } from "@/pages/auth/ui/signup-form";

interface AuthFeatureProps {
  onAuthenticated: () => void;
}

interface AuthPayload {
  data: { user: AuthUser; token: string };
}

type AuthMode = "login" | "signup" | "forgot";
type ForgotStep = "email" | "code" | "done";

const RESEND_COOLDOWN_MS = 30_000;

async function persistSession(payload: AuthPayload) {
  setAuthToken(payload.data.token);
  await saveAuthToken(payload.data.token);
}

export function AuthFeature({ onAuthenticated }: AuthFeatureProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [forgotStep, setForgotStep] = useState<ForgotStep>("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);

  const login = useMutation({
    mutationFn: (values: LoginValues) =>
      api.post("/api/v1/auth/login", { body: values }) as Promise<AuthPayload>,
    onSuccess: async (payload) => {
      await persistSession(payload);
      onAuthenticated();
    },
  });

  const signup = useMutation({
    mutationFn: (values: SignupValues) =>
      api.post("/api/v1/auth/register", {
        body: { ...values, fullName: values.fullName || null },
      }) as Promise<AuthPayload>,
    onSuccess: async (payload) => {
      await persistSession(payload);
      onAuthenticated();
    },
  });

  const forgotPassword = useMutation({
    mutationFn: (values: ForgotPasswordValues) =>
      api.post("/api/v1/auth/forgot-password", { body: values }),
    onSuccess: (_data, values) => {
      setForgotEmail(values.email);
      setForgotStep("code");
      startResendCooldown();
    },
  });

  const resetPassword = useMutation({
    mutationFn: (values: ResetPasswordValues) =>
      api.post("/api/v1/auth/reset-password", {
        body: { ...values, email: forgotEmail },
      }),
    onSuccess: () => setForgotStep("done"),
  });

  const startResendCooldown = () => {
    setResendDisabled(true);
    setTimeout(() => setResendDisabled(false), RESEND_COOLDOWN_MS);
  };

  const switchMode = (next: AuthMode) => {
    login.reset();
    signup.reset();
    forgotPassword.reset();
    resetPassword.reset();
    setForgotStep("email");
    setForgotEmail("");
    setMode(next);
  };

  return (
    <Screen>
      {mode === "login" ? (
        <LoginForm
          pending={login.isPending}
          errorMessage={
            login.isError ? extractApiErrorMessage(login.error) : null
          }
          onSubmit={(values) => login.mutate(values)}
          onSwitchToSignup={() => switchMode("signup")}
          onForgotPassword={() => switchMode("forgot")}
        />
      ) : mode === "signup" ? (
        <SignupForm
          pending={signup.isPending}
          errorMessage={
            signup.isError ? extractApiErrorMessage(signup.error) : null
          }
          onSubmit={(values) => signup.mutate(values)}
          onSwitchToLogin={() => switchMode("login")}
        />
      ) : forgotStep === "email" ? (
        <ForgotPasswordForm
          pending={forgotPassword.isPending}
          errorMessage={
            forgotPassword.isError
              ? extractApiErrorMessage(forgotPassword.error)
              : null
          }
          onSubmit={(values) => forgotPassword.mutate(values)}
          onBackToLogin={() => switchMode("login")}
        />
      ) : forgotStep === "code" ? (
        <ResetPasswordForm
          email={forgotEmail}
          pending={resetPassword.isPending}
          errorMessage={
            resetPassword.isError
              ? extractApiErrorMessage(resetPassword.error)
              : null
          }
          resendDisabled={resendDisabled || forgotPassword.isPending}
          onSubmit={(values) => resetPassword.mutate(values)}
          onResend={() => forgotPassword.mutate({ email: forgotEmail })}
          onBackToLogin={() => switchMode("login")}
        />
      ) : (
        <ResetSuccess onBackToLogin={() => switchMode("login")} />
      )}
    </Screen>
  );
}
