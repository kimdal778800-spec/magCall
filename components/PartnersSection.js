import { useState } from "react";
import { LayoutGrid, List } from "lucide-react"; // ✅ lucide-react 아이콘 사용

export default function PartnersSection() {
    const [viewMode, setViewMode] = useState("grid");

    const exchanges = [
        { name: "bybit", logo: "/logos/bybit.png", rate: "30%", discount: "20%", fee1: "0.014%", fee2: "0.0308%", tag: "최상위거래소🌟" },
        { name: "Bitget", logo: "/logos/bitget.png", rate: "45%", discount: "50%", fee1: "0.0111%", fee2: "0.022%", tag: "인기거래소🔥 자동환급" },
        { name: "OKX", logo: "/logos/okx.png", rate: "55%", discount: "0%", fee1: "0.009%", fee2: "0.022%", tag: "최상위거래소🌟" },
        { name: "BingX", logo: "/logos/bingx.png", rate: "60%", discount: "0%", fee1: "0.008%", fee2: "0.02%", tag: "인기거래소🔥" },
        { name: "Lbank", logo: "/logos/lbank.png", rate: "60%", discount: "0%", fee1: "0.008%", fee2: "0.02%", tag: "많은증정금💰 자동환급" },
        { name: "Tapbit", logo: "/logos/tapbit.png", rate: "70%", discount: "33%", fee1: "0.006%", fee2: "0.012%", tag: "최저수수료🔥 자동환급" },
    ];

    return (
        <section className="bg-white py-20 border-t border-gray-100">
            <div className="max-w-6xl mx-auto px-6">
                {/* 제목 + 보기 전환 버튼 */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center sm:text-left">
                        셀퍼럴 제휴 거래소
                    </h2>

                    {/* ✅ 카페24 스타일 탭 버튼 */}
                    <div className="flex bg-gray-100 rounded-full p-1">
                        <button
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                viewMode === "grid"
                                    ? "bg-orange-500 text-white shadow-md"
                                    : "text-gray-600 hover:text-gray-800"
                            }`}
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            카드
                        </button>
                        <button
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                viewMode === "list"
                                    ? "bg-orange-500 text-white shadow-md"
                                    : "text-gray-600 hover:text-gray-800"
                            }`}
                            onClick={() => setViewMode("list")}
                        >
                            <List className="w-4 h-4" />
                            리스트
                        </button>
                    </div>
                </div>

                {/* 카드형 보기 */}
                {viewMode === "grid" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {exchanges.map((ex, idx) => (
                            <div
                                key={idx}
                                className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-5 border border-gray-100"
                            >
                                <div className="bg-black rounded-md h-36 flex justify-center items-center mb-4">
                                    <img src={ex.logo} alt={ex.name} className="h-12 object-contain" />
                                </div>
                                <h3 className="text-gray-800 font-semibold mb-2">{ex.name}</h3>
                                <p className="text-sm text-gray-600 mb-2">
                                    수수료{" "}
                                    <span className="text-orange-500 font-semibold">{ex.rate}</span> 페이백{" "}
                                    + <span className="text-blue-600 font-semibold">{ex.discount}</span> 할인
                                </p>
                                <p className="text-xs text-gray-400 mb-3">
                                    지정가 {ex.fee1} 시장가 {ex.fee2}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-3">
                                    {ex.tag.split(" ").map((tag, tIdx) => (
                                        <span
                                            key={tIdx}
                                            className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full"
                                        >
                      {tag}
                    </span>
                                    ))}
                                </div>

                                <button className="w-full border border-orange-300 text-orange-500 py-2 rounded-md text-sm hover:bg-orange-50 transition">
                                    페이백 시작하기
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* 리스트형 보기 */}
                {viewMode === "list" && (
                    <div className="overflow-x-auto mt-4">
                        <table className="w-full text-sm text-gray-700 border-t border-gray-200">
                            <thead>
                            <tr className="text-gray-500 border-b">
                                <th className="py-3 text-left px-2">거래소명</th>
                                <th className="py-3 text-center">페이백</th>
                                <th className="py-3 text-center">할인</th>
                                <th className="py-3 text-center">지정가</th>
                                <th className="py-3 text-center">시장가</th>
                            </tr>
                            </thead>
                            <tbody>
                            {exchanges.map((ex, idx) => (
                                <tr key={idx} className="border-b hover:bg-gray-50 transition">
                                    <td className="py-3 px-2 flex items-center gap-3">
                                        <img src={ex.logo} alt={ex.name} className="h-8 w-8 rounded-full" />
                                        <div>
                                            <div className="font-medium text-gray-800">{ex.name}</div>
                                            <div className="text-xs text-gray-500">{ex.tag}</div>
                                        </div>
                                    </td>
                                    <td className="text-center font-semibold text-orange-500">{ex.rate}</td>
                                    <td className="text-center text-blue-600">{ex.discount}</td>
                                    <td className="text-center text-gray-700 font-medium">{ex.fee1}</td>
                                    <td className="text-center text-gray-700 font-medium">{ex.fee2}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}
