import { headers } from "next/headers";
import AuthLayout from "./auth-layout";
import { RoleProvider } from "@/lib/role-context";

export default async function AuthLayoutWrapper({ children }) {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  let role = "admin";

  console.log({ host });

  if (host.includes("dms")) role = "dealer";
  else if (host.includes("customer")) role = "customer";
  else if (host.includes("dashboard")) role = "admin";

  return (
    <AuthLayout role={role}>
      <RoleProvider role={role}>{children}</RoleProvider>
    </AuthLayout>
  );
}
