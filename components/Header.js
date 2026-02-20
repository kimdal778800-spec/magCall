"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import MobileMenu from "@/components/MobileMenu"; // ✅ 추가

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [sessionUser, setSessionUser] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const { user, logout } = useAuth();
    const [level, setLevel] = useState(0);
    const router = useRouter();

    const currentUser = user ?? sessionUser;

    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch("/api/me");
                const data = await res.json();
                if (data.loggedIn) {
                    setSessionUser(data.user);
                    setLevel(Number(data.user?.level ?? data.level ?? 0));
                }
            } catch (err) {
                console.error("세션 확인 오류:", err);
            }
        };
        checkSession();
    }, [user]);

    const handleLogout = async () => {
        try {
            await fetch("/api/logout", { method: "GET", credentials: "include" });
            if (typeof logout === "function") await logout();
            setSessionUser(null);
            setLevel(0);
            router.replace(router.asPath);
        } catch (err) {
            console.error("로그아웃 실패:", err);
        }
    };

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
                isScrolled ? "bg-white shadow-md" : "bg-blue-50"
            }`}
        >
            <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
                {/* 로고 */}
                <Link href="/" className="flex items-center">
                    <img
                        src="/logos/logo.png"
                        alt="로고"
                        className="block h-12 md:h-18 w-auto origin-left scale-150 md:scale-x-225"
                    />
                </Link>

                {/* 데스크탑 메뉴 */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <Link
                        href="/serviceInter/1"
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

                    {currentUser && Number(level) === 9 && (
                        <select
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value) router.push(`/${value}`);
                            }}
                            className="p-2 border-b border-gray-300 bg-transparent outline-none text-gray-800"
                        >
                            <option value="">선택</option>
                            <option value="admin/ServiceInter">서비스 소개</option>
                            <option value="admin/links">링크</option>
                            <option value="admin/adminPartnerList">제휴 거래소</option>
                        </select>
                    )}

                    {currentUser ? (
                        <div className="flex items-center gap-3">
              <span className="text-gray-700 font-medium">
                👋 {currentUser.name || currentUser.email}{" "}
                  {level === 9 && "관리자"} 님
              </span>
                            <button
                                onClick={handleLogout}
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
                {isMobile && (
                    <button
                        onClick={() => setMenuOpen(true)}
                        className="md:hidden text-gray-700 hover:text-orange-500 transition text-2xl"
                    >
                        ☰
                    </button>
                )}
            </div>

            {/* ✅ 분리된 모바일 메뉴 */}
            {isMobile && (
                <MobileMenu
                    isOpen={menuOpen}
                    onClose={() => setMenuOpen(false)}
                    currentUser={currentUser}
                    handleLogout={handleLogout}
                />
            )}
        </header>
    );
}
