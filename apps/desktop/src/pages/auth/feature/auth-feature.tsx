import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Screen } from "@/components/screen";
import { api, setAuthToken, type AuthUser } from "@/lib/api";
import { extractApiErrorMessage } from "@/lib/api-errors";
import { saveAuthToken } from "@/lib/secure-storage";
import { ForgotPasswordForm } from "@/pages/auth/ui/forgot-password-form";
import { LoginForm, type LoginValues } from "@/pages/auth/ui/login-form";
import { SignupForm, type SignupValues } from "@/pages/auth/ui/signup-form";

interface AuthFeatureProps {
  onAuthenticated: () => void;
}

interface AuthPayload {
  data: { user: AuthUser; token: string };
}

type AuthMode = "login" | "signup" | "forgot";

async function persistSession(payload: AuthPayload) {
  setAuthToken(payload.data.token);
  await saveAuthToken(payload.data.token);
}

export function AuthFeature({ onAuthenticated }: AuthFeatureProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

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

  const switchMode = (next: AuthMode) => {
    login.reset();
    signup.reset();
    setForgotSubmitted(false);
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
      ) : (
        <ForgotPasswordForm
          pending={false}
          submitted={forgotSubmitted}
          errorMessage={null}
          // UI only for now: the reset-password endpoint comes later, so
          // submitting just reveals the confirmation state
          onSubmit={() => setForgotSubmitted(true)}
          onBackToLogin={() => switchMode("login")}
        />
      )}
    </Screen>
  );
}
