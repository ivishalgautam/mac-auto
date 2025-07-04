import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// This route acts as a middleware between you and your backend server
export async function POST(request) {
  const cookieStore = await cookies();
  try {
    cookieStore.delete("token");
    cookieStore.delete("refresh_token");

    return NextResponse.json({ message: "Logged out." }, { status: 200 });
  } catch (err) {
    console.log("Error logging out in:", err);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
