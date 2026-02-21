import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";

export default function Partners() {
    const router = useRouter();
    const { user } = useAuth();
    const { showModal } = useModal();
    const isAdmin = user && Number(user.level) === 99;
    const [affiliates, setAffiliates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/affiliates/list")
            .then((r) => r.json())
            .then((data) => setAffiliates(data.affiliates || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id) => {
        if (!confirm("삭제하시겠습니까?")) return;
        const res = await fetch("/api/admin/affiliatesDelete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        if (res.ok) {
            setAffiliates((prev) => prev.filter((a) => a.id !== id));
        } else {
            await showModal("삭제 실패", "error");
        }
    };

    return (
        <div className="min-h-screen bg-pink-50 pt-[80px] md:pt-[90px] pb-16">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
                {/* 헤더 */}
                <div className="flex items-center justify-between py-5 md:py-8">
                    <div>
                        <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">제휴 업소</h1>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">추천 제휴 업소 목록입니다.</p>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => router.push("/admin/AffiliatesNew")}
                            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-full font-bold text-sm transition shadow-sm"
                        >
                            + 등록
                        </button>
                    )}
                </div>

                {/* 카드 목록 */}
                {loading ? (
                    <div className="text-center py-24 text-gray-400">불러오는 중...</div>
                ) : affiliates.length === 0 ? (
                    <div className="text-center py-24 text-gray-400">
                        <p className="text-5xl mb-4">🏪</p>
                        <p className="text-lg font-semibold text-gray-500">등록된 제휴 업소가 없습니다.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {affiliates.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                {/* 정사각형 이미지 */}
                                <div className="w-full aspect-square overflow-hidden bg-gray-100">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">🏪</div>
                                    )}
                                </div>
                                {/* 정보 */}
                                <div className="p-3 flex flex-col gap-2">
                                    <h3 className="font-bold text-gray-800 text-sm truncate">{item.name}</h3>
                                    <a
                                        href={item.url || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block text-center bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold py-2 rounded-full transition"
                                    >
                                        바로가기
                                    </a>
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-xs text-gray-400 hover:text-red-500 transition text-center"
                                        >
                                            삭제
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
