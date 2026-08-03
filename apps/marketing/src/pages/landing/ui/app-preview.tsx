// empty macOS-style window: the future app screenshot/live preview drops in here
export function AppPreview() {
  return (
    <div className="bg-card w-full overflow-hidden rounded-xl shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.3),0_24px_48px_-12px_rgba(0,0,0,0.5)]">
      <div className="flex h-10 items-center gap-2 px-4" aria-hidden="true">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
      </div>
      <div className="aspect-[16/10]" />
    </div>
  );
}
