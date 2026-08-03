import { Button } from "@atlas/ui/components/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold tracking-tight">Atlas</h1>
      <p className="text-muted-foreground">Stay focused. Study better.</p>
      <Button>Start a focus session</Button>
    </main>
  );
}
