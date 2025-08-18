import { cn } from "@/lib/utils";
import Image from "next/image";
import { Card, CardContent } from "../ui/card";

export default function AuthLayout({
  children,
  className,
  imageSrc = "/login.svg",
  imageAlt = "Authentication illustration",
  title = "Welcome back",
  subtitle = "Enter your credentials to access your account",
}) {
  return (
    <div
      className={cn(
        "from-background to-muted/20 flex min-h-screen items-center justify-center bg-gradient-to-br p-4",
        className,
      )}
    >
      <div className="w-full max-w-6xl">
        <Card className="bg-background/95 supports-[backdrop-filter]:bg-background/60 overflow-hidden border-0 shadow-2xl backdrop-blur">
          <CardContent className="grid min-h-[600px] p-0 lg:grid-cols-2">
            {/* Auth Form Section */}
            <div className="flex flex-col justify-center p-8 lg:p-12">
              <div className="mx-auto w-full max-w-sm space-y-6">
                <div className="space-y-2 text-center lg:text-left">
                  <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                  <p className="text-muted-foreground">{subtitle}</p>
                </div>
                {children}
              </div>
            </div>

            {/* Image Section */}
            <div className="from-primary/10 via-primary/5 relative hidden items-center justify-center bg-gradient-to-br to-transparent p-12 lg:flex">
              <div className="relative w-full max-w-md">
                <div className="from-primary/20 to-secondary/20 absolute inset-0 rounded-full bg-gradient-to-r opacity-30 blur-3xl" />
                <Image
                  src={imageSrc || "/placeholder.svg"}
                  alt={imageAlt}
                  width={400}
                  height={400}
                  className="relative z-10 h-auto w-full object-contain drop-shadow-2xl"
                  priority
                />
              </div>

              {/* Decorative Elements */}
              <div className="bg-primary/10 absolute top-8 right-8 h-20 w-20 rounded-full blur-xl" />
              <div className="bg-secondary/10 absolute bottom-8 left-8 h-32 w-32 rounded-full blur-2xl" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
