import "@/styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { ModalProvider } from "@/context/ModalContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Head from "next/head";
import { useScrollRestoration } from "@/components/hooks/useScrollRestoration";

export default function App({ Component, pageProps }) {
    // ✅ 훅은 컴포넌트 내부에서 직접 호출해야 함
    useScrollRestoration();
    return (
        <ThemeProvider>
        <AuthProvider>
        <ModalProvider>
            <>
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
