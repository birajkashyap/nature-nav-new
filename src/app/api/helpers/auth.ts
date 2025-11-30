import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getUserId() {
  const session = await getSession();
  if (!session?.user?.id) return null;
  return session.user.id;
}

export async function requireAuth() {
  const userId = await getUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

import { adminAuthOptions } from "@/lib/auth-admin";

export async function requireAdmin() {
  const session = await getServerSession(adminAuthOptions);
  const role = (session?.user as any)?.role;

  if (role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }
  return session?.user?.email; // Return email or id
}
