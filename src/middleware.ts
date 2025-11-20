// src/middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

// Next.js 16 requires matcher as a STRING or REGEX pattern.
export const config = {
  matcher: ["/contact", "/services", "/fleet", "/about"],
};
