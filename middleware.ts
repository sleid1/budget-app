import NextAuth from "next-auth";
import authConfig from "./auth.config";
import {
   authRoutes,
   publicRoutes,
   apiAuthPrefix,
   DEFAULT_LOGIN_REDIRECT,
   DEFAULT_LOGOUT_REDIRECT,
   adminRoutes,
} from "./routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
   const { nextUrl } = req;

   const isLoggedIn = !!req.auth;

   const userRole = req.auth?.user?.role;

   const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);

   const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

   const isAuthRoute = authRoutes.includes(nextUrl.pathname);

   const isAdminRoute = adminRoutes.includes(nextUrl.pathname);

   // Redirect unauthenticated users accessing `/` to DEFAULT_LOGOUT_REDIRECT
   if (nextUrl.pathname === "/") {
      return Response.redirect(
         new URL(
            isLoggedIn ? DEFAULT_LOGIN_REDIRECT : DEFAULT_LOGOUT_REDIRECT,
            nextUrl
         )
      );
   }

   if (isApiAuthRoute) {
      return;
   }

   if (isAuthRoute) {
      if (isLoggedIn) {
         return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
      }

      return;
   }

   // Protect admin routes
   if (isAdminRoute) {
      if (!isLoggedIn) {
         // Redirect unauthenticated users to the default logout route
         return Response.redirect(new URL(DEFAULT_LOGOUT_REDIRECT, nextUrl));
      }
      if (userRole !== "ADMIN") {
         // Redirect non-admin users to the default login redirect route
         return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
      }
      return;
   }

   // Redirect unauthenticated users from protected routes
   if (!isLoggedIn && !isPublicRoute) {
      return Response.redirect(new URL(DEFAULT_LOGOUT_REDIRECT, nextUrl));
   }

   return;
});

export const config = {
   matcher: [
      // Skip Next.js internals and all static files, unless found in search params
      "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
      // Always run for API routes
      "/(api|trpc)(.*)",
   ],
};
