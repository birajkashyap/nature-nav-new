// src/middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

// Next.js 16 requires matcher as a STRING or REGEX pattern.
// Only protect /contact, allow all other pages to be accessed without auth
export const config = {
  matcher: ["/contact"],
};
