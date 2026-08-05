import { Screen } from "@/components/screen";

interface ComingSoonProps {
  eyebrow: string;
  copy: string;
}

// shared placeholder screen for pages whose real content lands later
export function ComingSoon({ eyebrow, copy }: ComingSoonProps) {
  return (
    <Screen>
      <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col items-center gap-2 text-center duration-500">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
          {eyebrow}
        </p>
        <p className="text-muted-foreground text-sm">{copy}</p>
      </div>
    </Screen>
  );
}
