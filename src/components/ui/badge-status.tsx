import { cn } from "@/lib/utils/cn";

interface BadgeStatusProps {
  label: string;
  className?: string;
}

export function BadgeStatus({ label, className }: BadgeStatusProps) {
  return (
    <span className={cn("badge-status", className)}>
      {label}
    </span>
  );
}
