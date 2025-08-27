"use client";
import { createContext, useState, useContext, useEffect } from "react";
import { redirect, usePathname } from "next/navigation";
import axios from "axios";
import http from "@/utils/http";
import { endpoints } from "@/utils/endpoints";

export const AuthContext = createContext(null);

export async function handleLogout() {
  try {
    const resp = await axios.post("/api/logout");
    // const user = JSON.parse(localStorage.getItem("user"));

    if (resp.statusText === "OK") {
      window.location.href = `/`;
      // window.location.href = `/?r=${user.role}`;
    }
  } catch (error) {
    console.log(error?.response?.data?.message ?? error?.message ?? "Error");
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    setIsUserLoading(true);
    async function fetchData() {
      try {
        const user = await http().get(endpoints.profile);
        // const {
        //   data: { user },
        // } = await axios.get("/api/profile");
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
      } catch (error) {
        setUser(null);
        console.log(error);
      } finally {
        setIsUserLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isUserLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
