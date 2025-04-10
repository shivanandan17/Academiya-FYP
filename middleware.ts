import { authMiddleware } from "@clerk/nextjs";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware

// This is how you add unprotected route
// export default authMiddleware({ publicRoutes: ["/test"] });

export default authMiddleware({
  publicRoutes: ["/api/webhook", "/api/questions"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
