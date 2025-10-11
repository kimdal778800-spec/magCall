import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
     const [setUser] = useState(null);
    const { user, logout} = useAuth();

    // ✅ 로그인 세션 확인
    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch("/api/me");
                const data = await res.json();
                if (data.loggedIn) setUser(data.user);
            } catch (err) {
                console.error("세션 확인 오류:", err);
            }
        };
        checkSession();
    }, []);

    // ✅ 스크롤 감지 이벤트
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
                isScrolled ? "bg-white shadow-md" : "bg-blue-50"
            }`}
        >
            <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
                {/* 로고 */}
                <Link href="/" className="flex items-center gap-2">
                    <img src="/logo.png" alt="로고" className="h-6 md:h-7" />
                </Link>

                {/* 네비게이션 */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <Link
                        href="/about"
                        className="text-gray-700 hover:text-orange-500 transition"
                    >
                        서비스 소개
                    </Link>
                    <Link
                        href="/exchange"
                        className="text-gray-700 hover:text-orange-500 transition"
                    >
                        제휴 거래소
                    </Link>
                    <Link
                        href="/payback"
                        className="text-gray-700 hover:text-orange-500 transition"
                    >
                        예상 페이백
                    </Link>

                    {/* ✅ 로그인 상태 표시 */}
                    {user ? (
                        <div className="flex items-center gap-3">
              <span className="text-gray-700 font-medium">
                👋 {user.name || user.email} 님 환영합니다.
              </span>
                            <button
                                onClick={logout}
                                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-100 transition"
                            >
                                로그아웃
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link
                                href="/signup"
                                className="bg-orange-500 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-orange-600 transition shadow-sm"
                            >
                                회원가입
                            </Link>
                            <Link
                                href="/login"
                                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-100 transition"
                            >
                                로그인
                            </Link>
                        </div>
                    )}
                </nav>

                {/* 모바일 메뉴 버튼 */}
                <div className="md:hidden">
                    <button className="text-gray-700 hover:text-orange-500 transition">
                        ☰
                    </button>
                </div>
            </div>
        </header>
    );
}
