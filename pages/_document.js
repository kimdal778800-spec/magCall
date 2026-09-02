import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html lang="ko">
            <Head>
                {/* ✅ favicon 설정 */}
                <link rel="icon" href="/favicon.ico?v=4" />
                <meta name="theme-color" content="#ffffff" />
                <title>마사지콜 출장안마 출장마사지</title>

                {/* ✅ Google Search Console 인증 */}
                <meta name="google-site-verification" content="GzyQJ7LaPEaPUpzyBoNLAUBK9N-d9sGATk9mnlTqJTg" />

                {/* ✅ SEO 기본 메타 (페이지별로 next/head에서 동일한 key로 덮어씀) */}
                <meta key="description" name="description" content="마사지콜 - 전국 출장마사지, 출장안마 전문 플랫폼. 서울 출장마사지, 인천 출장마사지, 경기 출장안마 등 지역별 검증된 업체를 빠르게 찾아보세요." />
                <meta name="keywords" content="마사지콜, 출장마사지, 출장안마, 서울출장마사지, 서울출장안마, 강남출장마사지, 강남출장안마, 홍대출장마사지, 인천출장마사지, 인천출장안마, 부평출장마사지, 경기출장마사지, 경기출장안마, 수원출장마사지, 분당출장마사지, 일산출장마사지, 부산출장마사지, 부산출장안마, 대전출장마사지, 대전출장안마, 테마샵, 한국마사지, 일본마사지, 태국마사지, 출장, 안마, 마사지" />
                <meta name="robots" content="index, follow" />
                <meta name="author" content="마사지콜" />
                <meta name="language" content="ko" />

                {/* ✅ Open Graph (카카오, 페이스북 등 공유) */}
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="마사지콜" />
                <meta key="og:title" property="og:title" content="마사지콜 출장안마 출장마사지" />
                <meta key="og:description" property="og:description" content="전국 출장마사지, 출장안마 전문 플랫폼. 서울·인천·경기 등 지역별 검증된 업체를 빠르게 찾아보세요." />
                <meta key="og:url" property="og:url" content="https://msgcall.kr" />
                <meta property="og:locale" content="ko_KR" />

                {/* ✅ 카노니컬 (페이지별로 next/head에서 key="canonical"로 덮어씀) */}
                <link key="canonical" rel="canonical" href="https://msgcall.kr" />
            </Head>
            <body>
            <Main />
            <NextScript />
            </body>
        </Html>
    );
}
