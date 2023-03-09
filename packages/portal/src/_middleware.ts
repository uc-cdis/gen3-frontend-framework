import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const _middleware = (request: NextRequest) => {
  console.log("middlware");
  // Assume a "Cookie:nextjs=fast" header to be present on the incoming request
  // Getting cookies from the request using the `RequestCookies` API
  const cookie = request.cookies.get('fence')?.value
  console.log(cookie) // => 'fast'
  const allCookies = request.cookies.getAll()
  console.log(allCookies) // => [{ name: 'nextjs', value: 'fast' }]

  // Setting cookies on the response using the `ResponseCookies` API
  const response = NextResponse.next()
  return response;
}

export default _middleware;

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
