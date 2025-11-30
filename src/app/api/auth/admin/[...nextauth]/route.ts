import NextAuth from "next-auth";
import { adminAuthOptions } from "@/lib/auth-admin";

const handler = (req: any, res: any) => {
  console.log("Admin Auth Route Hit:", req.url);
  return NextAuth(req, res, adminAuthOptions);
};

export { handler as GET, handler as POST };
