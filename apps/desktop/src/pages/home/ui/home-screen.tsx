import { Button } from "@atlas/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@atlas/ui/components/card";
import type { AuthUser } from "@/lib/api";

interface HomeScreenProps {
  user: AuthUser;
  loggingOut: boolean;
  onLogout: () => void;
}

export function HomeScreen({ user, loggingOut, onLogout }: HomeScreenProps) {
  return (
    <main className="bg-background flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="bg-primary text-primary-foreground mb-2 flex size-14 items-center justify-center self-center rounded-full text-lg font-semibold">
            {user.initials}
          </div>
          <CardTitle>{user.fullName ?? user.email}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 text-center">
          <p className="text-muted-foreground text-sm">
            You are signed in. Focus sessions are coming soon.
          </p>
          <Button variant="secondary" onClick={onLogout} disabled={loggingOut}>
            {loggingOut ? "Logging out…" : "Log out"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
