import {useEffect, useState} from "react";
import { LayoutGrid, List } from "lucide-react";
import {useRouter} from "next/navigation"; // ✅ lucide-react 아이콘 사용

export default function PartnersSection() {
    const [viewMode, setViewMode] = useState("list");
    const [exchanges, setExchanges] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const exchanges = async () => {
            try {
                const res = await fetch("/api/admin/partnersList");
                const data = await res.json();
                setExchanges(data.exchanges || []);
            } catch (err) {
                console.error("거래소 목록 불러오기 오류:", err);
            }
        };
        exchanges();
    }, []);

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedIds.length === exchanges.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(exchanges.map((ex) => ex.id));
        }
    };

    return (
        <section className="bg-white py-20 border-t border-gray-100">
            <div className="max-w-6xl mx-auto px-6">
                {/* 제목 + 보기 전환 버튼 */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10">
                    <h2 className="text-2xl md:text-gray-500 font-bold text-gray-800 text-center sm:text-left">
                         <span className="text-red-300">셀퍼럴.kr</span> 제휴 거래소
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
                                key={ex.id}
                                className={`bg-white rounded-xl shadow-md hover:shadow-lg transition p-5 border border-gray-100 ${
                                    selectedIds.includes(ex.id) ? "bg-orange-50" : ""
                                }`}
                                onClick={() => {
                                    // ✅ 현재 스크롤 위치 저장
                                    sessionStorage.setItem("scrollPosition", window.scrollY);
                                    router.push(`/exchange/${ex.id}`);
                                }}
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
                            {exchanges.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="text-center text-gray-500 py-6 italic"
                                    >
                                        등록된 거래소가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                exchanges.map((ex) => (
                                    <tr
                                        key={ex.id}
                                        className={`\`border-b hover:bg-orange-50 transition cursor-pointer ${
                                            selectedIds.includes(ex.id) ? "bg-orange-50" : ""
                                        }`}
                                        onClick={() => {
                                            // ✅ 현재 스크롤 위치 저장
                                            sessionStorage.setItem("scrollPosition", window.scrollY);
                                            router.push(`/exchange/${ex.id}`);
                                        }}
                                    >

                                        <td className="py-3 px-2 flex items-center gap-3">
                                            <img
                                                src={ex.logo}
                                                alt={ex.name}
                                                className="h-8 w-8 rounded-full border"
                                            />
                                            <div>
                                                <div className="font-medium text-gray-800 hover:text-orange-600 transition">
                                                    {ex.name}
                                                </div>
                                                <div className="text-xs text-gray-500">{ex.tag}</div>
                                            </div>
                                        </td>
                                        <td className="text-center font-semibold text-orange-500">
                                            {ex.rate}
                                        </td>
                                        <td className="text-center text-blue-600">
                                            {ex.discount}
                                        </td>
                                        <td className="text-center text-gray-700 font-medium">
                                            {ex.fee1}
                                        </td>
                                        <td className="text-center text-gray-700 font-medium">
                                            {ex.fee2}
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}
