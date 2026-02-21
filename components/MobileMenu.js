"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { TABS } from "@/components/ShopsSection";

export default function MobileMenu({ isOpen, onClose, currentUser, handleLogout }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const handleTabClick = (code) => {
        setActiveTab(code);
        const params = new URLSearchParams();
        if (code !== "all") params.set("tab", code);
        const query = params.toString();
        router.push(`/${query ? "?" + query : ""}#shops`);
        onClose();
        setTimeout(() => {
            document.getElementById("shops")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    return (
        <>
            {/* 📱 모바일 메뉴 */}
            <div
                className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl transition-all duration-300 ease-out flex flex-col ${
                    isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
                }`}
                style={{ zIndex: 9999, pointerEvents: isOpen ? "auto" : "none" }}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-pink-100 bg-pink-50 shrink-0">
                    <span className="text-pink-500 font-bold text-base">🔍 업체 검색</span>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">✕</button>
                </div>

                {/* 스크롤 영역 */}
                <div className="flex-1 overflow-y-auto">
                    {/* 로그인 정보 */}
                    <div className="px-5 py-4 border-b border-gray-100">
                        {currentUser ? (
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700 font-medium text-sm">👋 {currentUser.name || currentUser.email} 님</span>
                                <button
                                    onClick={handleLogout}
                                    className="text-xs text-gray-500 border border-gray-300 px-3 py-1 rounded-full hover:bg-gray-100 transition"
                                >
                                    로그아웃
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Link href="/login" onClick={onClose}
                                    className="flex-1 text-center border border-gray-300 text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-gray-100 transition">
                                    로그인
                                </Link>
                                <Link href="/signup" onClick={onClose}
                                    className="flex-1 text-center bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-orange-600 transition">
                                    회원가입
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* 페이지 메뉴 */}
                    <div className="px-5 py-3 flex gap-3 border-b border-gray-100">
                        <Link href="/service" onClick={onClose}
                            className="text-gray-600 text-sm hover:text-pink-500 transition">서비스 소개</Link>
                        <span className="text-gray-300">|</span>
                        <Link href="/partners" onClick={onClose}
                            className="text-gray-600 text-sm hover:text-pink-500 transition">제휴 업소</Link>
                    </div>

                    {/* ── 카테고리 탭 ── */}
                    <div className="px-5 pt-5 pb-4">
                        <p className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-4">카테고리</p>
                        <div className="flex flex-col gap-3">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.code}
                                    onClick={() => handleTabClick(tab.code)}
                                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold border-2 transition-all ${
                                        activeTab === tab.code
                                            ? "bg-pink-500 border-pink-500 text-white shadow-lg scale-[1.02]"
                                            : "bg-pink-50 border-pink-200 text-gray-700 hover:border-pink-400 hover:bg-pink-100"
                                    }`}
                                >
                                    <span className="text-2xl leading-none">{tab.icon}</span>
                                    <span className="text-base">{tab.label}</span>
                                    {activeTab === tab.code && (
                                        <span className="ml-auto text-white text-xs">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 오버레이 */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 bg-black bg-opacity-40 z-[9998] transition-opacity duration-300"
                />
            )}
        </>
    );
}
