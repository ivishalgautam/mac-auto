import { cn } from "@/lib/utils";

export default function PageContainer({ children, className = "" }) {
  return (
    <div className={cn("bg-background h-full space-y-4 rounded-lg", className)}>
      {children}
    </div>
  );
}
