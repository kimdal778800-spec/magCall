import "@/styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { ModalProvider } from "@/context/ModalContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Head from "next/head";
import { useRouter } from "next/router";
import { useScrollRestoration } from "@/components/hooks/useScrollRestoration";

export default function App({ Component, pageProps }) {
    // ✅ 훅은 컴포넌트 내부에서 직접 호출해야 함
    useScrollRestoration();
    const router = useRouter();
    // ✅ 페이지별 canonical/og:url 기본값 — 개별 페이지가 key="canonical"/key="og:url"로 재정의하지 않는 한
    //    항상 현재 경로를 가리키도록 해서 모든 페이지가 홈으로 표준화되는 문제를 방지
    const canonicalUrl = `https://msgcall.kr${router.asPath.split("?")[0].split("#")[0]}`;
    return (
        <ThemeProvider>
        <AuthProvider>
        <ModalProvider>
            <>
                <Head key="default-seo">
                    {/* ✅ 기본값 — 개별 페이지가 next/head에서 동일한 key로 재정의하면 그 값이 우선 적용됨 */}
                    <title key="title">마사지콜 출장안마 출장마사지</title>
                    <meta key="description" name="description" content="마사지콜 - 전국 출장마사지, 출장안마 전문 플랫폼. 서울 출장마사지, 인천 출장마사지, 경기 출장안마 등 지역별 검증된 업체를 빠르게 찾아보세요." />
                    <meta key="robots" name="robots" content="index, follow" />
                    <link key="canonical" rel="canonical" href={canonicalUrl} />
                    <meta key="og:title" property="og:title" content="마사지콜 출장안마 출장마사지" />
                    <meta key="og:description" property="og:description" content="전국 출장마사지, 출장안마 전문 플랫폼. 서울·인천·경기 등 지역별 검증된 업체를 빠르게 찾아보세요." />
                    <meta key="og:url" property="og:url" content={canonicalUrl} />
                </Head>
                <Head key="global-favicon">
                    {/* ✅ 폰트 프리로드 */}
                    <link
                        rel="preload"
                        href="/fonts/THEmpgtR.otf"
                        as="font"
                        type="font/otf"
                        crossOrigin=""
                    />
                    <link
                        rel="preload"
                        href="/fonts/THEmpgtB_U.otf"
                        as="font"
                        type="font/otf"
                        crossOrigin=""
                    />
                    <link
                        rel="preload"
                        href="/fonts/THEmpgtM_U.otf"
                        as="font"
                        type="font/otf"
                        crossOrigin=""
                    />
                    <link rel="icon" href="/favicon.ico" />
                </Head>

                <div className="flex flex-col min-h-[100dvh] bg-gray-50 dark:bg-gray-900">
                    <Header />
                    <main className="flex-1">
                        <Component {...pageProps} />
                    </main>
                    <Footer />
                </div>
            </>
        </ModalProvider>
        </AuthProvider>
        </ThemeProvider>
    );
}
