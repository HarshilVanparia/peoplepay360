import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Explicitly kick unauthenticated users to login immediately
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const role = token.role as string;

    if (path.startsWith('/payroll') && !['HR Payroll User', 'HR Payroll Manager', 'Admin'].includes(role)) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    if (
      (path.startsWith('/employees') || path.startsWith('/contracts') || path.startsWith('/schedules')) &&
      !['HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'].includes(role)
    ) {
      if (path === '/employees') return NextResponse.redirect(new URL('/', req.url));
    }

    if (
      (path.startsWith('/time-off/allocations') || path.startsWith('/time-off/types')) &&
      !['HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'].includes(role)
    ) {
      return NextResponse.redirect(new URL('/time-off/requests', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Let the middleware function handle the strict token check
    },
  }
);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};