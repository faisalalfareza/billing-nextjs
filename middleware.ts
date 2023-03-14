import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function middleware(request: NextRequest) {
  const { url, nextUrl, cookies, headers } = request;
  const isAuthenticated = cookies.has("accessToken");

  if (!isAuthenticated)
    return NextResponse.rewrite(
      new URL("/authentication/sign-in", request.url)
    );
  else {
    const refererUrl = headers.get("referer"); // console.log("REFERER URL", refererUrl);
    const requestUrl = url; // console.log("REQUEST URL", requestUrl);

    if (
      nextUrl.pathname == "/" ||
      nextUrl.pathname == "/authentication/sign-in"
    ) {
      return NextResponse.redirect(`${nextUrl.origin}/dashboards`);
    } else {
      //   // if (
      //   //     ((refererUrl != null) && (!refererUrl.includes("/authentication/sign-in"))) &&
      //   //     (refererUrl != requestUrl)
      //   // ) {
      //   //   return NextResponse.redirect(refererUrl);
      //   // }
    }
  }
}

export default middleware;

export const config = {
  matcher: [
    /*
        Match all request paths except for the ones starting with:
        - api (API routes)
        - _next/static (static files)
        - _next/image (image optimization files)
        - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
  // matcher: '/about/:path*',
  // matcher: ['/about/:path*', '/dashboard/:path*'],
  // matcher: '/api/:function*',
};
