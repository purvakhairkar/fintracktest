import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-strong-secret-key-change-this-in-production'
);

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  if (pathname === '/login' || pathname === '/api/auth/login') {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('token');

  // If no token and trying to access protected route, redirect to login
  if (!token && pathname !== '/login') {
    // For API routes, return 401 instead of redirecting
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If token exists, verify it
  if (token) {
    try {
      const { payload } = await jwtVerify(token.value, JWT_SECRET);

      // If logged in and trying to access login page, redirect to home
      if (pathname === '/login') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Check admin-only routes
      if (pathname === '/add-bill' && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Add user info to headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.id.toString());
      requestHeaders.set('x-user-role', payload.role);
      requestHeaders.set('x-user-username', payload.username);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      // Token is invalid, redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};
