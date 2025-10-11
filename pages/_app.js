import "@/styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

export default function App({ Component, pageProps }) {
    return (
        <AuthProvider>
            <div className="flex flex-col min-h-[100dvh] bg-gray-50">
                <Header />
                <main className="flex-1">
                    <Component {...pageProps} />
                </main>
                <Footer />
            </div>
        </AuthProvider>
    );
}
