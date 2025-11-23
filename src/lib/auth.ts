import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        return isValid ? user : null;
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account }) {
      // Google must always return email
      if (account?.provider === "google" && !user.email) {
        return "/login?error=NoEmail";
      }

      // Find the user in database
      const existingUser = user.email
        ? await prisma.user.findUnique({
            where: { email: user.email },
            include: { accounts: true },
          })
        : null;

      // CASE 1: User DOES NOT exist → block login → ask to signup
      if (!existingUser) {
        return "/login?error=NoAccount"; // your UI will show toast
      }

      // CASE 2: User exists & login is through Google → link Google account if not linked
      if (account?.provider === "google") {
        const isLinked = existingUser.accounts.some(
          (acc) => acc.provider === "google"
        );

        if (!isLinked) {
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: account.type!,
              provider: account.provider!,
              providerAccountId: account.providerAccountId!,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
            },
          });
        }
      }

      return true; // allow sign-in
    },

    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },

    async redirect({ baseUrl }) {
      return `${baseUrl}/contact`;
    },
  },
};
