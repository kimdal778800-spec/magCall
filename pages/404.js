import { useRouter } from "next/router";
import Head from "next/head";

export default function NotFound() {
    const router = useRouter();

    return (
        <>
            <Head>
                <title>페이지를 찾을 수 없습니다 | 마사지콜</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <div className="min-h-screen bg-pink-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <p className="text-8xl font-black text-pink-200 mb-4">404</p>
                    <h1 className="text-xl font-bold text-gray-700 mb-2">페이지를 찾을 수 없습니다</h1>
                    <p className="text-sm text-gray-400 mb-8">삭제되었거나 존재하지 않는 페이지입니다.</p>
                    <button
                        onClick={() => router.push("/")}
                        className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-2xl font-bold text-sm transition shadow-md"
                    >
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        </>
    );
}
