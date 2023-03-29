import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // if (req.nextauth.token && req.nextUrl.pathname.startsWith("/sign-in")) {
    //   return NextResponse.redirect(new URL("/", req.url));
    // }else if (!req.nextauth.token && req.nextUrl.pathname.startsWith("/sign-in")) {
    //   return NextResponse.next()
    // }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (token) {
          return true;
        }
        return false;
      },
    },
  }
);

export const config = { matcher: ["/",] };