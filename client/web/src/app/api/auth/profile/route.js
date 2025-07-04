import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";
import axios from "axios";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request) {
  const cookieStore = await cookies();
  let token = cookieStore.get("token")?.value;
  const refresh_token = cookieStore.get("refresh_token")?.value;
  if (!token) {
    if (!refresh_token) {
      return NextResponse.json(
        { message: "No user logged in" },
        { status: 401 }
      );
    }

    // const newTokenData = await axios.post("/api/refresh-token");
    const newTokenData = await http().post(endpoints.auth.refresh, {
      refresh_token,
    });
    if (!newTokenData) {
      cookieStore.delete("token");
      cookieStore.delete("refresh_token");
      return NextResponse.redirect(new URL("/login", request.url));
    }
    token = newTokenData.token;
    cookieStore.set("token", token, {
      path: "/",
      expires: new Date(newTokenData.expires),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  try {
    const res = await axios.get(API_URL + endpoints.profile, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = res.data;

    return NextResponse.json({ user: data }, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { message: error?.response?.data?.message ?? "Something went wrong" },
      { status: error.status }
    );
  }
}
