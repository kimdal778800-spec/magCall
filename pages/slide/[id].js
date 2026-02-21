import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import "react-quill/dist/quill.snow.css";

export default function SlideDetail() {
    const router = useRouter();
    const { id } = router.query;
    const [slide, setSlide] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchSlide = async () => {
            try {
                const res = await fetch(`/api/slide/${id}`);
                if (!res.ok) {
                    router.push("/");
                    return;
                }
                const data = await res.json();
                setSlide(data.slide);
            } catch (err) {
                console.error("슬라이드 조회 오류:", err);
                router.push("/");
            } finally {
                setLoading(false);
            }
        };

        fetchSlide();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
                로딩 중...
            </div>
        );
    }

    if (!slide) return null;

    return (
        <>
            <Head>
                <title>{slide.name} | 마사지콜</title>
                <meta name="description" content={slide.name} />
            </Head>

            <div className="min-h-screen bg-gray-50 py-10 px-4">
                <div className="max-w-3xl mx-auto">
                    {/* 뒤로가기 */}
                    <button
                        onClick={() => router.back()}
                        className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition"
                    >
                        ← 뒤로가기
                    </button>

                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        {/* 대표 이미지 */}
                        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
                            <img
                                src={slide.image}
                                alt={slide.name}
                                className="w-full h-full object-cover"
                            />
                            {/* 제목 오버레이 */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-6 py-4">
                                <h1 className="text-white text-xl md:text-2xl font-bold">
                                    {slide.name}
                                </h1>
                                <p className="text-white/60 text-xs mt-1">{slide.createdAt}</p>
                            </div>
                        </div>

                        {/* 본문 내용 */}
                        <div className="p-6 md:p-8">
                            {slide.content ? (
                                <div
                                    className="ql-editor slide-content"
                                    dangerouslySetInnerHTML={{ __html: slide.content }}
                                />
                            ) : (
                                <p className="text-gray-400 text-sm text-center py-8">
                                    내용이 없습니다.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
