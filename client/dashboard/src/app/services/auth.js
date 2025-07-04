"use server";

import { redirect } from "next/navigation";

// export async function handleLogout() {
//   try {
//     const resp = await axios.post("/api/logout");
//     console.log({ resp });
//     return resp.data;
//     redirect("/");
//   } catch (error) {
//     console.log(error?.response?.data?.message ?? error?.message ?? "Error");
//     return error;
//   }
// }
