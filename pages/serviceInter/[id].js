// pages/serviceInter/[id].js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DOMPurify from "dompurify";

export default function ExchangeDetail() {
    const router = useRouter();
    const { id } = router.query;

    const [serviceInter, setServiceInter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState("");

    useEffect(() => {
        if (!id) return; // 아직 동적 라우트 준비 전이면 대기

        let cancelled = false;
        const controller = new AbortController();

        (async () => {
            setLoading(true);
            setErrMsg("");

            try {
                const res = await fetch(`/api/serviceInter/detail?id=${id}`, {
                    signal: controller.signal,
                });

                if (!res.ok) {
                    // 4xx/5xx 처리
                    const text = await res.text().catch(() => "");
                    setErrMsg(text || `요청 실패 (status ${res.status})`);
                    return;
                }

                const data = await res.json();
                if (!data?.success || !data?.serviceInter) {
                    setErrMsg(data?.message || "데이터를 불러오지 못했습니다.");
                    return;
                }

                if (!cancelled) setServiceInter(data.serviceInter);
            } catch (e) {
                if (!cancelled) setErrMsg("네트워크/서버 오류가 발생했습니다.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen text-gray-500">
                불러오는 중입니다...
            </div>
        );
    }

    if (errMsg) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-16 text-center text-red-600">
                {errMsg}
            </div>
        );
    }

    if (!serviceInter) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-16 text-center text-gray-500">
                서비스 소개 정보를 찾을 수 없습니다.
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 pt-[100px]">
            {/* 상단 제목만 남기기 */}
            <div className="flex justify-center items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">
                    {serviceInter.name}
                </h1>
            </div>

            {/* 서비스 소개 설명 */}
            <div className="mb-12">
                {/*<h2 className="text-lg font-semibold text-gray-800 mb-3">서비스 소개</h2>*/}
                <div
                    className="prose max-w-none ql-editor"
                    dangerouslySetInnerHTML={{ __html: typeof window !== "undefined" ? DOMPurify.sanitize(serviceInter.description) : serviceInter.description }}
                ></div>
            </div>

            {/* ✅ 하단 오른쪽에 돌아가기 버튼 */}
            <div className="flex justify-end">
                <button
                    onClick={() => {
                        router.push("/"); // ✅ 목록 페이지로 이동
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-md shadow-sm font-medium"
                >
                    ← 돌아가기
                </button>
            </div>
        </div>

    );
}
