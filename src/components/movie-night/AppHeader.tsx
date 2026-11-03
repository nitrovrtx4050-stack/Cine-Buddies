import { Link } from "@tanstack/react-router";
import { Popcorn } from "lucide-react";

import { cn } from "@/lib/utils";

export interface AppHeaderProps {
  /** Signed-in (mock) user name shown as a chip on the right. */
  userName?: string | null | undefined;
  subtitle?: string | undefined;
  className?: string;
}

export function AppHeader({ userName, subtitle, className }: AppHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_20px_-8px_color-mix(in_oklab,var(--color-primary)_70%,transparent)]">
            <Popcorn size={18} strokeWidth={2} />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight text-foreground">Movie Night Planner</span>
            {subtitle ? (
              <span className="max-w-[45vw] truncate text-xs text-muted-foreground">{subtitle}</span>
            ) : null}
          </span>
        </Link>
        {userName ? (
          <span className="max-w-[40vw] truncate rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
            {userName}
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/signin"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground no-underline"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 no-underline"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
