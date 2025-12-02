import { cn } from "@/lib/utils";

export default function LayoutLoader() {
  return (
    <div className="flex min-h-svh w-full flex-1 items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-5 w-5", className)}>
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="animate-spinner absolute left-1/2 top-1/2 h-[8%] w-[24%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground"
          style={{
            transform: `rotate(${30 * i}deg) translate(146%)`,
            animationDelay: `${-1.2 + 0.1 * i}s`,
          }}
        />
      ))}
    </div>
  );
}