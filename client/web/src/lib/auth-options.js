import config from "@/config";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import auth from "@/services/auth";
import { cookies } from "next/headers";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: config.google_client_id,
      clientSecret: config.google_client_secret,
    }),
    GithubProvider({
      clientId: config.github_client_id,
      clientSecret: config.github_client_secret,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      const payload = {
        email: profile.email,
        username: profile.email,
        first_name: profile.given_name,
        last_name: profile.family_name,
        provider: account.provider,
        provider_account_id: account.providerAccountId,
      };

      try {
        const { data } = await auth.login(payload);
        const cookieStore = await cookies();
        cookieStore.set("token", data.token, {
          path: "/",
          expires: new Date(data.expire_time),
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });

        cookieStore.set("refresh_token", data.refresh_token, {
          path: "/",
          expires: new Date(data.refresh_expire_time),
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });

        return true;
      } catch (error) {
        console.log(error);
      }
    },
  },
};
