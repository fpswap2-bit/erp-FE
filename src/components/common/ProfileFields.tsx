import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export function Field({
  label,
  htmlFor,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-w-0 space-y-2 ${className}`}>
      <Label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

export function Value({ children }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-10 items-center rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm whitespace-pre-wrap break-words">
      {children || <span className="text-muted-foreground">Not provided</span>}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}