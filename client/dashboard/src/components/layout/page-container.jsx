import { cn } from "@/lib/utils";

export default function PageContainer({ children, className = "" }) {
  return (
    <div
      className={cn(
        "bg-background animate-in fade-in slide-in-from-bottom-8 h-full space-y-4 rounded-lg duration-500",
        className,
      )}
    >
      {children}
    </div>
  );
}
