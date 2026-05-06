import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/server';

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    // 💡 응답 객체에서 data (또는 error) 를 꺼냅니다.
    const response = await auth.getSession({
      fetchOptions: {
        headers: request.headers,
      },
    });

    // 데이터 안에 세션 정보가 들어있습니다.
    const sessionData = response.data;
    
    // 유저 정보가 있는지 확인
    console.log(`[Proxy] Path: ${pathname}, User Exist: ${!!sessionData?.user}`);

    // 로그인 정보가 없으면 리다이렉트
    if (!sessionData?.user) { 
      const url = request.nextUrl.clone();
      url.pathname = '/auth/sign-in';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};