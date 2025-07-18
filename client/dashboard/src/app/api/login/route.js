import { endpoints } from "@/utils/endpoints";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// This route acts as a middleware between you and your backend server
export async function POST(request) {
  const data = await request.json();
  const cookieStore = await cookies();
  try {
    // login request to the original backend
    const res = await fetch(API_URL + endpoints.auth.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data.body,
    });
    const json = await res.json();
    if (res.ok) {
      cookieStore.set("token", json.token, {
        path: "/",
        expires: new Date(json.expire_time),
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NEXT_PUBLIC_NODE_ENV === "production",
      });

      cookieStore.set("refresh_token", json.refresh_token, {
        path: "/",
        expires: new Date(json.refresh_expire_time),
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NEXT_PUBLIC_NODE_ENV === "production",
      });
    }
    // Return the same response as the external backend.
    return NextResponse.json(json, { status: res.status });
  } catch (err) {
    console.log("Error logging in:", err);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
