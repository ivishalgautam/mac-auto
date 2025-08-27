// lib/role-context.tsx
"use client";
import { createContext, useContext } from "react";

const RoleContext = createContext("admin");
export const useRole = () => useContext(RoleContext);

export function RoleProvider({ role, children }) {
  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}
