import { cn } from "@/lib/utils";

export const ProductSkeleton = ({ compact }: { compact?: boolean }) => {
  return (
    <div className={cn("freshon-card overflow-hidden p-2.5 animate-pulse", compact && "p-1.5")}>
      {/* Image Skeleton */}
      <div className="relative aspect-square rounded-xl bg-surface-dark" />
      
      {/* Badges Skeleton */}
      <div className="mt-2.5 flex gap-1">
        <div className="h-4 w-12 rounded-full bg-surface-dark" />
        <div className="h-4 w-16 rounded-full bg-surface-dark" />
      </div>

      {/* Title & Info Skeleton */}
      <div className="mt-2 h-4 w-3/4 rounded bg-surface-dark" />
      <div className="mt-1 h-3 w-1/2 rounded bg-surface-dark" />

      {/* Price & Action Skeleton */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="h-5 w-14 rounded bg-surface-dark" />
          <div className="h-3 w-8 rounded bg-surface-dark" />
        </div>
        <div className="h-8 w-16 rounded-full bg-surface-dark" />
      </div>
    </div>
  );
};

export const CategorySkeleton = () => (
  <div className="flex w-24 shrink-0 flex-col items-center gap-2 p-3 animate-pulse">
    <div className="h-14 w-14 rounded-full bg-surface-dark" />
    <div className="h-3 w-12 rounded bg-surface-dark" />
  </div>
);
