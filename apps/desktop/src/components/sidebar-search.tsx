import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@atlas/ui/components/avatar";
import { cn } from "@atlas/ui/lib/utils";
import { api } from "@/lib/api";
import { NAV_ITEM } from "@/components/app-sidebar";

const DEBOUNCE_MS = 300;
const MIN_CHARS = 2; // mirrors the API validator's minLength

/** setTimeout-deferred echo of a fast-changing value. */
function useDebounced(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

/**
 * Self-contained user search: owns its input state and query, navigates
 * to /u/$username on pick. Keyboard scope is deliberately minimal for v1
 * — Escape closes, rows are tabbable buttons (Tab/Enter work natively);
 * arrow-key roving highlight is a follow-up.
 */
export function SidebarSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const trimmed = useDebounced(query, DEBOUNCE_MS).trim();
  const enabled = trimmed.length >= MIN_CHARS;

  const results = useQuery({
    queryKey: ["users", "search", trimmed],
    queryFn: () => api.get("/api/v1/users/search", { query: { q: trimmed } }),
    enabled,
    retry: false,
    staleTime: 30_000,
    // previous results stay visible between keystrokes — no flicker
    placeholderData: keepPreviousData,
  });

  // click-outside closes; pointerdown so it beats focus juggling
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const pick = (username: string) => {
    setOpen(false);
    setQuery("");
    void navigate({ to: "/u/$username", params: { username } });
  };

  const users = results.data?.data ?? [];

  return (
    // NO data-tauri-drag-region anywhere in this subtree — the input
    // must receive clicks, not drag the window
    <div ref={containerRef} className="relative mb-2">
      {/* same clothes as the Start button: NAV_ITEM + permanent fill */}
      <label className={cn(NAV_ITEM, "bg-foreground/5 cursor-text")}>
        <Search
          aria-hidden="true"
          className="text-muted-foreground size-4 shrink-0"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          maxLength={50}
          placeholder={t("sidebar.search.placeholder")}
          // preflight gives inputs `font: inherit` — NAV_ITEM's 13px carries
          className="text-foreground placeholder:text-muted-foreground w-full min-w-0 bg-transparent outline-none"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
        />
      </label>

      {open && enabled && (
        <div
          role="listbox"
          aria-label={t("sidebar.search.resultsLabel")}
          className="bg-popover animate-in fade-in-0 zoom-in-95 absolute top-full left-0 z-50 mt-1 w-64 rounded-xl p-1.5 shadow-[0_0_0_1px_var(--surface-ring),0_12px_32px_-8px_var(--surface-shadow)]"
        >
          {results.isError ? (
            <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
              {t("sidebar.search.error")}
            </p>
          ) : results.isPending ? (
            <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
              {t("sidebar.search.searching")}
            </p>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
              {t("sidebar.search.empty")}
            </p>
          ) : (
            users.map((user) =>
              // the API filters username-less users out — belt and braces
              user.username === null ? null : (
                <button
                  key={user.id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => pick(user.username!)}
                  className="hover:bg-foreground/5 flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors"
                >
                  <Avatar className="size-7">
                    <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
                    <AvatarFallback className="text-[10px]">
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium">
                      {user.name}
                    </span>
                    <span className="text-muted-foreground block truncate text-[11px]">
                      @{user.username}
                    </span>
                  </span>
                </button>
              ),
            )
          )}
        </div>
      )}
    </div>
  );
}
