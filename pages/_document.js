import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html lang="ko">
            <Head>
                {/* ✅ favicon 설정 */}
                <link rel="icon" href="/favicon.ico?v=4" />
                <meta name="theme-color" content="#ffffff" />

                {/* ✅ Google Search Console 인증 */}
                <meta name="google-site-verification" content="GzyQJ7LaPEaPUpzyBoNLAUBK9N-d9sGATk9mnlTqJTg" />

                {/* ✅ SEO 공통 메타 (페이지별로 달라지는 title/description/canonical/og:*·robots는
                    _document가 아니라 _app.js 기본값 + 각 페이지의 next/head 재정의로 처리됨.
                    _document의 <Head>에 직접 쓴 태그는 next/head보다 항상 우선 적용되어
                    페이지별로 덮어쓸 수 없기 때문) */}
                <meta name="keywords" content="마사지콜, 출장마사지, 출장안마, 서울출장마사지, 서울출장안마, 강남출장마사지, 강남출장안마, 홍대출장마사지, 인천출장마사지, 인천출장안마, 부평출장마사지, 경기출장마사지, 경기출장안마, 수원출장마사지, 분당출장마사지, 일산출장마사지, 부산출장마사지, 부산출장안마, 대전출장마사지, 대전출장안마, 테마샵, 한국마사지, 일본마사지, 태국마사지, 출장, 안마, 마사지" />
                <meta name="author" content="마사지콜" />
                <meta name="language" content="ko" />

                {/* ✅ Open Graph (카카오, 페이스북 등 공유) - 페이지별로 안 바뀌는 것만 */}
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="마사지콜" />
                <meta property="og:locale" content="ko_KR" />
            </Head>
            <body>
            <Main />
            <NextScript />
            </body>
        </Html>
    );
}
