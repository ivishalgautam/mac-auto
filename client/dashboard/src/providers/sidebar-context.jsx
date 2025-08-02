import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

export default function SidebarContext({ children }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
