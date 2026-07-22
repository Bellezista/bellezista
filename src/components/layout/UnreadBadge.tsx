import { cn } from "@/lib/utils";

interface UnreadBadgeProps {
  count: number;
  className?: string;
}

// Monochrome by design -- this is a functional count, not a marketing pill,
// so it stays inside the "no colored badges" rule rather than fighting it.
export function UnreadBadge({ count, className }: UnreadBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "inline-flex min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 py-0.5 text-xs font-semibold text-background",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
