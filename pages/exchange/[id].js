// pages/exchange/[id].js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function ExchangeDetail() {
    const router = useRouter();
    const { id } = router.query;

    const [exchange, setExchange] = useState(null);
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
                const res = await fetch(`/api/exchange/detail?id=${id}`, {
                    signal: controller.signal,
                });

                if (!res.ok) {
                    // 4xx/5xx 처리
                    const text = await res.text().catch(() => "");
                    setErrMsg(text || `요청 실패 (status ${res.status})`);
                    return;
                }

                const data = await res.json();
                if (!data?.success || !data?.exchange) {
                    setErrMsg(data?.message || "데이터를 불러오지 못했습니다.");
                    return;
                }

                if (!cancelled) setExchange(data.exchange);
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

    if (!exchange) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-16 text-center text-gray-500">
                거래소 정보를 찾을 수 없습니다.
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 pt-[100px]">
            {/* 상단 제목만 남기기 */}
            <div className="flex justify-center items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">
                    {exchange.name} 상세정보
                </h1>
            </div>

            {/* 거래소 로고 */}
            {exchange.logo && (
                <div className="flex justify-center mb-10">
                    <img
                        src={exchange.logo}
                        alt={exchange.name}
                        className="w-48 h-48 object-contain border rounded-xl p-4 bg-white shadow-sm"
                    />
                </div>
            )}

            {/* 주요 정보 테이블 */}
            <table className="w-full border border-gray-300 mb-10 text-sm md:text-base">
                <tbody>
                <tr className="border-b">
                    <th className="text-red-300 w-40 p-3 text-left font-semibold">
                        거래소명 :
                    </th>
                    <td className="p-3">{exchange.name}</td>
                </tr>
                <tr className="border-b">
                    <th className="text-red-300 p-3 text-left font-semibold">
                        페이백 (%) :
                    </th>
                    <td className="p-3">{exchange.rate}</td>
                </tr>
                <tr className="border-b">
                    <th className="text-red-300 p-3 text-left font-semibold">
                        할인 (%) :
                    </th>
                    <td className="p-3">{exchange.discount}</td>
                </tr>
                <tr className="border-b">
                    <th className="text-red-300 p-3 text-left font-semibold">
                        지정가 수수료 :
                    </th>
                    <td className="p-3">{exchange.fee1}</td>
                </tr>
                <tr>
                    <th className="text-red-300 p-3 text-left font-semibold">
                        시장가 수수료 :
                    </th>
                    <td className="p-3">{exchange.fee2}</td>
                </tr>
                </tbody>
            </table>

            {/* 거래소 설명 */}
            <div className="mb-12">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">거래소 설명</h2>

                <div
                    className="prose max-w-none ql-editor"
                    dangerouslySetInnerHTML={{ __html: exchange.description }}
                ></div>

            </div>

            {/* ✅ 하단 오른쪽에 돌아가기 버튼 */}
            <div className="flex justify-end">
                <button
                    onClick={() => {
                        const savedY = sessionStorage.getItem("scrollPosition");
                        router.push("/"); // ✅ 목록 페이지로 이동

                        // ✅ 페이지 이동 완료 후 부드럽게 스크롤 복원
                        if (savedY) {
                            setTimeout(() => {
                                window.scrollTo({
                                    top: parseFloat(savedY),
                                    behavior: "smooth", // ✅ 부드러운 이동
                                });
                            }, 300); // 라우팅 완료 후 살짝 딜레이
                        }
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-md shadow-sm font-medium"
                >
                    ← 돌아가기
                </button>
            </div>
        </div>

    );
}
