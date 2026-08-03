import { Button } from "@atlas/ui/components/button";

function App() {
  return (
    <main className="bg-background flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-light tracking-tight">Atlas</h1>
      <p className="text-muted-foreground text-sm">
        Desktop app — ready to build.
      </p>
      <Button>Start a focus session</Button>
    </main>
  );
}

export default App;
