import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";

export const adminAuthOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      id: "admin-login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // TEMPORARY WORKAROUND: Hardcoded due to Next.js env var corruption bug
        // TODO: Fix environment variable loading issue
        const adminEmail = process.env.ADMIN_EMAIL || "admin@company.com";
        const adminPasswordHash = "$2b$10$A9tNhIsAv1AuZobcAVYli./EdR61cJFoC1OnNfoBRIWqMWEyoD6Xa";

        if (!adminEmail || !adminPasswordHash) {
          throw new Error("Admin credentials not configured");
        }

        console.log("Admin Auth Attempt:", credentials?.email);
        console.log("Expected Email:", adminEmail);
        console.log("Password Length:", credentials?.password?.length);
        console.log("Hash Prefix:", adminPasswordHash?.substring(0, 10));
        
        const passwordMatch = credentials?.password && adminPasswordHash 
          ? bcrypt.compareSync(credentials.password, adminPasswordHash)
          : false;
        
        console.log("Password Match:", passwordMatch);
        console.log("Email Match:", credentials?.email === adminEmail);
        
        if (
          credentials?.email === adminEmail &&
          passwordMatch
        ) {
          console.log("Admin Auth Success");
          return {
            id: "admin-user",
            name: "Administrator",
            email: adminEmail,
            role: "admin",
            isAdmin: true,
          };
        }
        
        console.log("Admin Auth Failed: Invalid credentials");
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = "admin";
        token.isAdmin = true;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/signin",
    error: "/admin/signin",
  },
  cookies: {
    sessionToken: {
      name: `next-auth.admin-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};
