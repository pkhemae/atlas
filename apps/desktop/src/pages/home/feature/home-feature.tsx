import { Screen } from "@/components/screen";

export function HomeFeature() {
  return (
    <Screen>
      <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col items-center gap-2 text-center duration-500">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
          Atlas
        </p>
        <p className="text-muted-foreground text-sm">
          Your focus dashboard is coming soon.
        </p>
      </div>
    </Screen>
  );
}
