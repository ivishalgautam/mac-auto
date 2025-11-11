"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { H1 } from "../ui/typography";

export default function AuthLayout({
  children,
  className,
  imageSrc = "/login.png",
  imageAlt = "Authentication illustration",
  title = "Welcome back",
  subtitle = "Enter your credentials to access your account",
  role,
}) {
  return (
    <div
      className={cn(
        "bg-background flex h-screen w-screen items-center justify-center overflow-hidden",
        className,
      )}
    >
      <div className="grid h-full w-full p-0 lg:grid-cols-2">
        {/* Auth Form Section */}
        <div className="flex flex-col justify-center">
          <div className="mx-auto w-full max-w-sm space-y-6">
            {role && (
              <H1 className={"text-accent text-center"}>{role} portal</H1>
            )}
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              <p className="text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>

        {/* Image Section */}
        <div className="from-primary/10 via-primary/5 relative hidden items-center justify-center bg-gradient-to-br to-transparent lg:flex lg:flex-col lg:gap-4">
          <Image
            src={"/logo-dark.png"}
            alt={"Mac Auto India"}
            width={200}
            height={200}
            className="relative z-10 h-auto object-contain drop-shadow-2xl"
            priority
          />

          <div className="relative w-full max-w-xl">
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
      </div>
    </div>
  );
}
