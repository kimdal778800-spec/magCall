"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import MobileMenu from "@/components/MobileMenu";

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
                isScrolled ? "bg-pink-50 dark:bg-gray-900 shadow-md dark:shadow-gray-800" : "bg-pink-50 dark:bg-gray-900"
            }`}
        >
            <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
                {/* 로고 */}
                <Link href="/" className="flex items-center gap-2 shrink-0">
                    <span className="text-2xl md:text-3xl">📞</span>
                    <span className="text-xl md:text-2xl font-extrabold tracking-tight">
                        <span className="text-gray-800 dark:text-white">마사지</span>
                        <span className="text-red-500">콜</span>
                    </span>
                </Link>

                {/* 데스크탑 우측 메뉴 */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <Link
                        href="/service"
                        className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition"
                    >
                        서비스 소개
                    </Link>
                    <Link
                        href="/partners"
                        className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition"
                    >
                        제휴 업소
                    </Link>

                    {currentUser ? (
                        <div className="flex items-center gap-3">
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                                👋 {currentUser.name || currentUser.email}{" "}
                                {level === 99 && "관리자"} 님
                            </span>
                            <button
                                onClick={handleLogout}
                                className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
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
                                className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
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
                        className="md:hidden text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition text-2xl"
                    >
                        ☰
                    </button>
                )}
            </div>

            {/* 분리된 모바일 메뉴 */}
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
