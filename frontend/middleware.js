import { jwtVerify } from "jose";
import { NextResponse } from "next/server"


export default async function middleware(req) {
  //get the token form the cookies
  const token = req.cookies.get('token')?.value ;
  const refreshToken = req.cookies.get('refreshToken')?.value ;

  //IF THERE IS NO TOKEN...
  if (!token && !refreshToken ) {

    const { pathname } = req.nextUrl;
    const publicRoutes = ['/not-found', '/example'];
    const authRoutes = ['/signin', '/signup'];

    if (publicRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    if (!authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/signin', req.url));
    }

    return NextResponse.next();
  }

  //IF WE HAVE THE TOKENS...

  // IF THE TOKEN IS EXPIRES:

  //encode the secret key
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  let payload;
  let refreshPayload;
   try {
      const { payload: verifiedPayload } = await jwtVerify(token, secret);
      payload = verifiedPayload;

      const { payload: RverifiedPayload } = await jwtVerify(refreshToken, secret);
      refreshPayload = RverifiedPayload;
      return NextResponse.next();

    } catch (err) {
      console.log("Token check failed:", err.code || err.name);
      payload = null;
    }

      const { pathname } = req.nextUrl
      const isAuth = !!payload      
      const userRole = payload?.role || 'visitor';
     //IF EVERYTHING IS RIGHT AND USER IS AUTHORIZED, WE CAN PROCEED WITH THE MIDDLEWARE:

    // Routes that are always public (accessible to everyone)
    const publicRoutes = ['/not-found', '/example...']     
      
    // Public routes when logged out, private when logged in
    const authRoutes = ['/signin', '/signup']

    // Define route permissions
    const routePermissions = {
      '/': ['admin', 'lawyer', 'visitor'],
      '/admin/lawyer': ['admin'],
    }

    // If the current path is a public route, allow access regardless of auth status
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next()
    }

    if (isAuth && authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    
    if (!isAuth && !authRoutes.includes(pathname)  && !publicRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/signin', req.url))
    }

    // Check route permissions for authenticated users
    if (isAuth && userRole) {
      // Admin can access all routes
      if (userRole === 'admin') {
        return NextResponse.next()
      }

      // Check if the current path is restricted
      const allowedRoles = routePermissions[pathname]
      if (allowedRoles && !allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }
    
    return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
