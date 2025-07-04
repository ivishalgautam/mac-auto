"use client";
import { createContext, useState, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    setIsUserLoading(true);
    async function fetchData() {
      try {
        // const user = await http().get(endpoints.profile);
        const {
          data: { user },
        } = await axios.get("/api/profile");
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
      } catch (error) {
        setUser(null);
        console.log(error);
      } finally {
        setIsUserLoading(false);
      }
    }
    // if (!["/login"].includes(pathname)) {
    fetchData();
    // } else {
    //   setIsUserLoading(false);
    // }
  }, [pathname]);

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
