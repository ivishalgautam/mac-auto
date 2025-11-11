import { endpoints } from "@/utils/endpoints";
import axios from "axios";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// This route acts as a middleware between you and your backend server
export async function POST(request) {
  const data = await request.json();
  try {
    // login request to the original backend
    const res = await axios.post(
      API_URL + endpoints.auth.resetPassword + `?token=${data.token}`,
      JSON.parse(data.body),
    );
    const json = res.data;
    // Return the same response as the external backend.
    return NextResponse.json(json, { status: res.status });
  } catch (err) {
    // console.log("Error register user:", err);
    return NextResponse.json(
      {
        message:
          err?.response?.data?.message ??
          err?.message ??
          "Something went wrong",
      },
      { status: err.status },
    );
  }
}
