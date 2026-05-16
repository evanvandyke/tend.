import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/now', '/browse', '/projects', '/modules', '/settings'];
const authPaths = ['/sign-in', '/sign-up'];

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('authjs.session-token')
    || request.cookies.get('__Secure-authjs.session-token');

  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some(p => pathname.startsWith(p));
  const isAuthPage = authPaths.some(p => pathname.startsWith(p));

  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL('/now', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|sw.js|manifest.webmanifest).*)'],
};
