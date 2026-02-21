"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useModal } from "@/context/ModalContext";

export default function Links() {
    const [links, setLinks] = useState([]);
    const [sessionUser, setSessionUser] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const router = useRouter();
    const { showModal } = useModal();

    // ✅ 페이지 진입 시 로그인 및 level 체크
    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch("/api/me");
                const data = await res.json();

                if (!data.loggedIn || Number(data.user?.level) !== 99) {
                    await showModal("접근 권한이 없습니다. 로그인 페이지로 이동합니다.", "warning");
                    router.push("/login");
                    return;
                }

                setSessionUser(data.user);
            } catch (err) {
                console.error("세션 확인 오류:", err);
                router.push("/login");
            }
        };

        checkSession();
    }, [router]);

    // ✅ DB에서 링크 목록 가져오기
    useEffect(() => {
        const fetchLinks = async () => {
            try {
                const res = await fetch("/api/admin/linksList", {
                    method: "GET",
                    credentials: "include",
                });

                const data = await res.json();
                setLinks(data.links || []);
            } catch (err) {
                console.error("링크 불러오기 오류:", err);
            }
        };
        fetchLinks();
    }, []);

    // ✅ 체크박스 선택/해제
    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // ✅ 선택 삭제
    const handleDelete = async () => {
        if (selectedIds.length === 0) {
            await showModal("삭제할 항목을 선택하세요.", "warning");
            return;
        }

        if (!confirm("선택한 항목을 삭제하시겠습니까?")) return;

        try {
            const res = await fetch("/api/admin/linksDelete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ ids: selectedIds }),
            });

            if (res.ok) {
                await showModal("삭제가 완료되었습니다.", "success");
                setLinks((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
                setSelectedIds([]);
            } else {
                const data = await res.json();
                await showModal(data.message || "삭제 실패", "error");
            }
        } catch (err) {
            console.error("삭제 요청 오류:", err);
            await showModal("서버 오류가 발생했습니다.", "error");
        }
    };

    // ✅ 로딩 중 표시
    if (!sessionUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
                권한 확인 중...
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-lg p-8 md:p-10">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
                    📋 슬라이드 관리
                </h1>

                {/* ✅ 리스트 */}
                {links.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {links.map((item) => (
                            <div
                                key={item.id}
                                className={`group border border-gray-100 rounded-xl overflow-hidden shadow-sm transition bg-white ${
                                    selectedIds.includes(item.id) ? "ring-2 ring-orange-400" : ""
                                }`}
                            >
                                <div className="relative w-full h-48 overflow-hidden cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="absolute top-2 left-2 w-4 h-4 z-10 accent-orange-500"
                                        checked={selectedIds.includes(item.id)}
                                        onChange={() => toggleSelect(item.id)}
                                    />
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                        onClick={() => router.push(`/admin/linksEdit/${item.id}`)}
                                    />
                                </div>
                                <div className="p-4 text-center">
                                    <h2 className="text-lg font-semibold text-gray-800 group-hover:text-orange-500 transition">
                                        {item.name}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        📅 {item.createdAt}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 mt-6">
                        등록된 링크가 없습니다.
                    </p>
                )}

                {/* ✅ 하단 버튼 */}
                <div className="flex justify-center gap-4 mt-10">
                    <Link
                        href="/admin/LinksNew"
                        className="bg-orange-500 text-white px-6 py-2.5 rounded-md font-semibold text-sm hover:bg-orange-600 transition shadow-sm"
                    >
                        + 새 슬라이드 작성
                    </Link>

                    <button
                        onClick={handleDelete}
                        className="bg-red-500 text-white px-6 py-2.5 rounded-md font-semibold text-sm hover:bg-red-600 transition shadow-sm"
                    >
                        🗑 선택 삭제
                    </button>
                </div>

                <p className="text-center text-gray-400 text-sm mt-10">
                    SELFERRAL.KR © 2025 All Rights Reserved
                </p>
            </div>
        </div>
    );
}
