import { endpoints } from "@/utils/endpoints";
import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(Request) {
  const cookieStore = await cookies();
  const refresh_token = cookieStore.get("refresh_token")?.value;
  if (!refresh_token) {
    return NextResponse.json(
      { error: "Refresh token missing" },
      { status: 401 },
    );
  }

  try {
    const response = await axios.post(API_URL + endpoints.auth.refresh, {
      refresh_token,
    });
    const json = response.data;
    cookieStore.set("token", json.token, {
      path: "/",
      expires: new Date(json.expire_time),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NEXT_PUBLIC_NODE_ENV === "production",
    });
    return NextResponse.json(json, { status: response.status });
  } catch (error) {
    cookieStore.delete("token");
    cookieStore.delete("refresh_token");
    return NextResponse.json(error, { status: error.status });
  }
}
