import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
  User,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { env } from "@/env.mjs";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      name: string;
      email: string;
      picture: string;
      sub: string;
      id: string;
      username: string;
      global_name?: any;
      display_name?: any;
      avatar: string;
      avatar_decoration?: any;
      discriminator: string;
      public_flags: number;
      flags: number;
      banner?: any;
      banner_color: string;
      accent_color: number;
      locale: string;
      mfa_enabled: boolean;
      premium_type: number;
      verified: boolean;
      image_url: string;
      iat: number;
      exp: number;
      jti: string;
    };
  }

  interface User {
    name: string;
    email: string;
    picture: string;
    sub: string;
    id: string;
    username: string;
    global_name?: any;
    display_name?: any;
    avatar: string;
    avatar_decoration?: any;
    discriminator: string;
    public_flags: number;
    flags: number;
    banner?: any;
    banner_color: string;
    accent_color: number;
    locale: string;
    mfa_enabled: boolean;
    premium_type: number;
    verified: boolean;
    image_url: string;
    iat: number;
    exp: number;
    jti: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, user, token }) {
      session.user = token as any;
      return session;
    },
    jwt({ token, user, account, profile }) {
      return { ...token, ...profile };
    },
  },
  pages:{
    signIn: "/sign-in",
    error: "/error"
  },
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
  ],
};

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
