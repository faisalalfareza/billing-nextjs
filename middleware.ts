import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

let alreadyLoggedIn: boolean = false;
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
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ]
};


// Fungsi untuk pengecekan pengguna belum terautentikasi
function handleNotAuthenticated(request: NextRequest) {
  const { nextUrl } = request;

  // console.log("————————————————————NOT AUTHENTICATED");
  
  // Reset status alreadyLoggedIn
  // alreadyLoggedIn && console.log("————————————————————LOGGED OUT");
  alreadyLoggedIn = false;
  // Arahkan ke halaman masuk atau autentikasi
  return NextResponse.rewrite(new URL("/authentication/sign-in", nextUrl.origin));
}

function middleware(request: NextRequest) {
  const { nextUrl, cookies, headers } = request;
  const isAuthenticated = cookies.has("accessToken");
  
  // console.log("\n\n\n");
  // console.log("IS AUTHENTICATED (HAS): ", cookies.has("accessToken"));
  // console.log("IS AUTHENTICATED (GET): ", cookies.get("accessToken"));
  // console.log("IS LOGGED IN: ", alreadyLoggedIn);

  /* 
    1. AUTENTIKASI (AUTHENTICATION): 
    Pengecekan apakah user terautentikasi/tidak berdasarkan 1) memiliki/tidaknya sebuah token, 2) token yang valid 
  */
  
  // Cek jika pengguna belum terautentikasi
  if (!alreadyLoggedIn && !isAuthenticated) {
    return handleNotAuthenticated(request);
  }
  // Cek jika pengguna terautentikasi, dan normal
  else if (alreadyLoggedIn || isAuthenticated) {
    // isAuthenticated && console.log("————————————————————AUTHENTICATED");
    // alreadyLoggedIn && console.log("————————————————————ALREADY LOGGED IN");

    // Cek jika pengguna terautentikasi, tetapi mencoba mengakses halaman awal atau halaman autentikasi sign-in
    if ((
      nextUrl.pathname === "/authentication/sign-in" ||
      nextUrl.pathname.includes("/authentication/sign-in")
    ) && alreadyLoggedIn) {
      return isAuthenticated 
        ? NextResponse.redirect(`${nextUrl.origin}/dashboards`) 
        : handleNotAuthenticated(request); // Logout or redirect to sign-in
    }
    else {
      // Set status alreadyLoggedIn menjadi true setelah autentikasi yang valid
      // !alreadyLoggedIn && console.log("————————————————————LOGGED IN");
      alreadyLoggedIn = true; 

      /* 
        2. AUTORISASI (AUTHORIZATION): 
        Pengecekan apakah user memiliki hak akses ke suatu routing berdasarkan memiliki/tidaknya permission terkait
      */

      

      // Jika semua kondisi terpenuhi, lanjutkan dengan pemrosesan berikutnya
      return NextResponse.next();
    }
  }
}

export default middleware;