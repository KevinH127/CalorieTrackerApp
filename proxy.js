import { auth } from "./auth";

export default async function proxy(request) {
  const session = await auth();
  
  // Protect all non-auth routes
  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || 
                      request.nextUrl.pathname.startsWith("/register") || 
                      request.nextUrl.pathname.startsWith("/api/register") ||
                      request.nextUrl.pathname.startsWith("/api/auth");
                      
  if (!session && !isAuthRoute) {
    return Response.redirect(new URL("/login", request.url));
  }
  
  // Optional: Redirect authenticated users away from login/register
  if (session && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register")) {
    return Response.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
