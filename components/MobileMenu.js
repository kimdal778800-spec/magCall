"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function MobileMenu({ isOpen, onClose, currentUser, handleLogout }) {
    // ✅ 메뉴 열릴 때 body 스크롤 잠금
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <>
            {/* 📱 모바일 메뉴 */}
            <div
                className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transition-all duration-300 ease-out ${
                    isOpen ? "right-0 opacity-100" : "-right-64 opacity-0"
                }`}
                style={{
                    zIndex: 9999,
                    pointerEvents: isOpen ? "auto" : "none",
                    willChange: "right, opacity",
                }}
            >
                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 text-gray-600 text-2xl hover:text-orange-500"
                >
                    ✕
                </button>

                {/* 메뉴 내용 */}
                <div className="flex flex-col mt-14 space-y-4 px-6 select-none">
                    {/* ✅ 로그인 상태 */}
                    {currentUser ? (
                        <>
              <span className="text-gray-800 font-medium text-center">
                👋 {currentUser.name || currentUser.email} 님
              </span>
                            <button
                                onClick={handleLogout}
                                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-100 transition text-center"
                            >
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/login"
                                onClick={onClose}
                                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-100 transition text-center"
                            >
                                로그인
                            </Link>
                            <Link
                                href="/signup"
                                onClick={onClose}
                                className="bg-orange-500 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-orange-600 transition text-center shadow-sm"
                            >
                                회원가입
                            </Link>
                        </div>
                    )}

                    {/* 구분선 */}
                    <div className="border-t border-gray-300 my-4"></div>

                    {/* ✅ 일반 메뉴 */}
                    <Link
                        href="/serviceInter/1"
                        className="text-gray-700 text-base hover:text-orange-500 transition"
                        onTouchStart={(e) => e.stopPropagation()} // 모바일 터치 버그 방지
                        onClick={() => {
                            onClose();
                        }}
                    >
                        서비스 소개
                    </Link>

                    <Link
                        href="/exchange"
                        className="text-gray-700 text-base hover:text-orange-500 transition"
                        onTouchStart={(e) => e.stopPropagation()} // 모바일 터치 버그 방지
                        onClick={() => {
                            onClose();
                        }}
                    >
                        제휴 거래소
                    </Link>
                </div>
            </div>

            {/* 오버레이 */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 bg-black bg-opacity-30 z-[9998] transition-opacity duration-300"
                ></div>
            )}
        </>
    );
}
