import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";

export default function Service() {
    const router = useRouter();
    const { user } = useAuth();
    const { showModal } = useModal();
    const isAdmin = user && Number(user.level) === 99;
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/service/list")
            .then((r) => r.json())
            .then((data) => setItems(data.items || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id) => {
        if (!confirm("삭제하시겠습니까?")) return;
        const res = await fetch("/api/admin/serviceDelete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        if (res.ok) {
            setItems((prev) => prev.filter((item) => item.id !== id));
        } else {
            await showModal("삭제 실패", "error");
        }
    };

    return (
        <div className="min-h-screen bg-pink-50 pt-[80px] md:pt-[90px] pb-16">
            <div className="max-w-4xl mx-auto px-4 md:px-6">
                {/* 헤더 */}
                <div className="flex items-center justify-between py-5 md:py-8">
                    <div>
                        <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">서비스 소개</h1>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">마사지콜 서비스를 소개합니다.</p>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => router.push("/admin/ServiceNew")}
                            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-full font-bold text-sm transition shadow-sm"
                        >
                            + 등록
                        </button>
                    )}
                </div>

                {/* 목록 */}
                {loading ? (
                    <div className="text-center py-24 text-gray-400">불러오는 중...</div>
                ) : items.length === 0 ? (
                    <div className="text-center py-24 text-gray-400">
                        <p className="text-5xl mb-4">📋</p>
                        <p className="text-lg font-semibold text-gray-500">등록된 서비스 소개가 없습니다.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                                <div className="flex items-start justify-between mb-4">
                                    <h2 className="text-lg font-bold text-gray-800">{item.title}</h2>
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-xs text-gray-400 hover:text-red-500 transition ml-4 shrink-0"
                                        >
                                            삭제
                                        </button>
                                    )}
                                </div>
                                <div
                                    className="ql-editor shop-content prose max-w-none text-gray-700"
                                    dangerouslySetInnerHTML={{ __html: item.content }}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
