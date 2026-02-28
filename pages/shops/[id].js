import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import DOMPurify from "dompurify";
import { useModal } from "@/context/ModalContext";
import { REGIONS, TABS } from "@/components/ShopsSection";

function getRegionLabel(code) {
    const r = REGIONS.find((r) => r.code === code);
    return r ? r.label : code;
}

function getSubLabel(regionCode, subCode) {
    const r = REGIONS.find((r) => r.code === regionCode);
    if (!r) return subCode;
    const s = r.subs.find((s) => s.code === subCode);
    return s ? s.label : subCode;
}

function getCategoryLabel(code) {
    const t = TABS.find((t) => t.code === code);
    return t ? t.label : code;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function PhoneModal({ phone, onClose }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-5"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-3xl shadow-inner">
                    📞
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mb-1">전화 문의</p>
                    <p className="text-3xl font-extrabold text-gray-800 tracking-wide">{phone}</p>
                    <p className="text-sm text-gray-400 mt-2">위 번호로 전화하시면 빠르게 연결됩니다.</p>
                </div>
                <a
                    href={`tel:${phone}`}
                    className="w-full text-center bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-2xl font-bold text-base transition shadow-md"
                >
                    📱 모바일에서 바로 전화
                </a>
                <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 transition">
                    닫기
                </button>
            </div>
        </div>
    );
}

function CommentSection({ shopId }) {
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const { showModal: showAlertModal } = useModal();
    const textareaRef = useRef(null);

    // 로그인 유저 확인
    useEffect(() => {
        fetch("/api/me")
            .then((r) => r.json())
            .then((d) => { if (d.loggedIn) setCurrentUser(d.user); })
            .catch(() => {});
    }, []);

    // 댓글 목록 로드
    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/shops/${shopId}/comments`);
            const data = await res.json();
            setComments(data.comments || []);
        } catch {}
    };

    useEffect(() => {
        if (shopId) fetchComments();
    }, [shopId]);

    // 댓글 등록
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/shops/${shopId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
            if (res.ok) {
                setContent("");
                await fetchComments();
            } else {
                const d = await res.json();
                await showAlertModal(d.message || "등록 실패", "error");
            }
        } catch {
            await showAlertModal("서버 오류가 발생했습니다.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    // 댓글 삭제
    const handleDelete = async (commentId) => {
        if (!confirm("댓글을 삭제하시겠습니까?")) return;
        try {
            const res = await fetch(`/api/shops/${shopId}/comments`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ commentId }),
            });
            if (res.ok) await fetchComments();
            else {
                const d = await res.json();
                await showAlertModal(d.message || "삭제 실패", "error");
            }
        } catch {
            await showAlertModal("서버 오류가 발생했습니다.", "error");
        }
    };

    return (
        <div className="mt-6 bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
                💬 댓글
                <span className="text-sm font-normal text-gray-400">({comments.length})</span>
            </h2>

            {/* 댓글 입력 */}
            {currentUser ? (
                <form onSubmit={handleSubmit} className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-sm font-bold text-pink-500">
                            {(currentUser.name || currentUser.email || "?")[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                            {currentUser.name || currentUser.email}
                        </span>
                    </div>
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="댓글을 입력하세요... (최대 500자)"
                        maxLength={500}
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-pink-300 focus:border-pink-300 outline-none resize-none transition"
                    />
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">{content.length} / 500</span>
                        <button
                            type="submit"
                            disabled={submitting || !content.trim()}
                            className="bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white px-5 py-2 rounded-xl font-semibold text-sm transition"
                        >
                            {submitting ? "등록 중..." : "등록"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="mb-6 bg-gray-50 rounded-xl px-5 py-4 text-sm text-gray-500 text-center border border-gray-100">
                    <span className="font-semibold text-pink-500">로그인</span> 후 댓글을 작성할 수 있습니다.&nbsp;
                    <a href="/login" className="underline text-pink-400 hover:text-pink-600 transition">로그인하기</a>
                </div>
            )}

            {/* 댓글 목록 */}
            {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                    아직 작성된 댓글이 없습니다.
                </div>
            ) : (
                <ul className="flex flex-col gap-4">
                    {comments.map((c) => (
                        <li key={c.id} className="flex gap-3">
                            {/* 아바타 */}
                            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-sm font-bold text-pink-500 shrink-0 mt-0.5">
                                {(c.user_name || "?")[0].toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-semibold text-gray-700">{c.user_name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">{formatDate(c.created_at)}</span>
                                        {currentUser && (currentUser.id === c.user_id || Number(currentUser.level) === 99) && (
                                            <button
                                                onClick={() => handleDelete(c.id)}
                                                className="text-xs text-gray-400 hover:text-red-400 transition"
                                            >
                                                삭제
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                                    {c.content}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function ShopDetail() {
    const router = useRouter();
    const { id } = router.query;
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!id) return;
        const fetchShop = async () => {
            try {
                const res = await fetch(`/api/shops/${id}`);
                const data = await res.json();
                if (res.ok) setShop(data.shop);
                else router.replace("/");
            } catch {
                router.replace("/");
            } finally {
                setLoading(false);
            }
        };
        fetchShop();
    }, [id]);

    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") setShowModal(false); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-pink-50 flex items-center justify-center pt-[64px]">
                <div className="text-gray-400 text-lg">불러오는 중...</div>
            </div>
        );
    }

    if (!shop) return null;

    const regionLabel = getRegionLabel(shop.region);
    const subLabel = shop.sub_region ? getSubLabel(shop.region, shop.sub_region) : "";
    const categoryLabel = getCategoryLabel(shop.category);

    return (
        <>
            <Head>
                <title>{shop.name} | 마사지콜</title>
            </Head>

            {showModal && shop.phone && (
                <PhoneModal phone={shop.phone} onClose={() => setShowModal(false)} />
            )}

            <div className="min-h-screen bg-pink-50 pt-[80px] pb-16">
                <div className="max-w-3xl mx-auto px-4">

                    {/* 업체 카드 */}
                    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                        {shop.image && (
                            <div className="w-full max-h-[480px] overflow-hidden bg-gray-100">
                                <img
                                    src={shop.image}
                                    alt={shop.name}
                                    className="w-full h-full object-cover object-top"
                                    style={{ maxHeight: "480px" }}
                                />
                            </div>
                        )}

                        <div className="p-6 md:p-8">
                            <span className="inline-block text-xs bg-pink-100 text-pink-500 px-3 py-1 rounded-full font-semibold border border-pink-200 mb-3">
                                {categoryLabel}
                            </span>
                            <h1 className="text-2xl font-bold text-gray-800 mb-4">{shop.name}</h1>

                            <div className="flex flex-col gap-3 mb-6">
                                {(regionLabel || subLabel) && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="text-lg">📍</span>
                                        <span>{regionLabel}{subLabel && ` · ${subLabel}`}</span>
                                    </div>
                                )}
                                {shop.phone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="text-lg">📞</span>
                                        <span className="text-pink-500 font-semibold">{shop.phone}</span>
                                    </div>
                                )}
                            </div>

                            {shop.description && <hr className="border-gray-100 mb-6" />}
                            {shop.description && (
                                <div
                                    className="ql-editor shop-content text-gray-700 text-sm leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: typeof window !== "undefined" ? DOMPurify.sanitize(shop.description) : shop.description }}
                                />
                            )}
                        </div>
                    </div>

                    {/* 하단 버튼 */}
                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={() => router.back()}
                            className="flex-1 bg-white border border-gray-200 hover:border-pink-300 hover:text-pink-500 text-gray-600 py-3.5 rounded-2xl font-semibold text-sm transition shadow-sm"
                        >
                            ← 목록으로
                        </button>
                        {shop.phone && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex-[2] bg-pink-500 hover:bg-pink-600 text-white py-3.5 rounded-2xl font-bold text-base transition shadow-md"
                            >
                                📞 전화 문의하기
                            </button>
                        )}
                    </div>

                    {/* 댓글 섹션 */}
                    <CommentSection shopId={id} />

                </div>
            </div>
        </>
    );
}
