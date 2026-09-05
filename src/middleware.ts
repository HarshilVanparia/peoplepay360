import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token) return NextResponse.redirect(new URL('/login', req.url));

    const role = token.role as string;

    // 1. Block Employees & HR Managers from Payroll[cite: 2]
    if (path.startsWith('/payroll') && !['HR Payroll User', 'HR Payroll Manager', 'Admin'].includes(role)) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // 2. Block standard Employees from HR Master Data[cite: 2]
    if (
      (path.startsWith('/employees') || path.startsWith('/contracts') || path.startsWith('/schedules')) &&
      !['HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'].includes(role)
    ) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // 3. Block standard Employees from Time Off Administration[cite: 2]
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
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};
