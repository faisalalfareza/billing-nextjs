import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

let isLoggedIn: boolean = false;
export const config = {
  matcher: [
    /*
        Match all request paths except for the ones starting with:
        - api (API routes)
        - _next/static (static files)
        - _next/image (image optimization files)
        - favicon.ico (favicon file)
     */
    // "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ]
};

export default function middleware(request: NextRequest) {
  const { url, nextUrl, cookies, headers } = request;
  const isAuthenticated = cookies.has("accessToken");
  
  // Securing api routes
  if (nextUrl.pathname.startsWith("/api")) {
    if (
      !isAuthenticated &&
      (nextUrl.pathname != "/api/authentication/authenticate")
    ) {
      nextUrl.searchParams.set("from", nextUrl.pathname);
      nextUrl.pathname = "/authentication/sign-in";

      return NextResponse.redirect(nextUrl);
    } 

    return NextResponse.next();
  }
  // Securing pages routes
  else {
    if (!isAuthenticated) {
      isLoggedIn = false;
      return NextResponse.rewrite(new URL("/authentication/sign-in", url));
    }

    const refererUrl = headers.get("referer");
    const requestUrl = url;

    if (
      nextUrl.pathname == "/" ||
      nextUrl.pathname == "/authentication/sign-in"
    ) {
      return NextResponse.redirect(`${nextUrl.origin}/dashboards`);
    } else {
      if (
        (!isLoggedIn) &&
        ((refererUrl != null) && (!refererUrl.includes("/authentication/sign-in"))) &&
        ((refererUrl != requestUrl) && (requestUrl.includes("/dashboards")))
      ) {
        return NextResponse.redirect(refererUrl);
      }

      isLoggedIn = true;
    }
  }
}
