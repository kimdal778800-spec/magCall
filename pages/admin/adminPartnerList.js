import { useState, useEffect } from "react";
import { List, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PartnersAdmin() {
    const [exchanges, setExchanges] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const router = useRouter();

    // ✅ 거래소 목록 불러오기
    useEffect(() => {
        const fetchExchanges = async () => {
            try {
                const res = await fetch("/api/admin/partnersList");
                const data = await res.json();
                setExchanges(data.exchanges || []);
            } catch (err) {
                console.error("거래소 목록 불러오기 오류:", err);
            }
        };
        fetchExchanges();
    }, []);

    // ✅ 개별 선택 토글
    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id]
        );
    };

    // ✅ 전체 선택 토글
    const toggleAll = () => {
        if (selectedIds.length === exchanges.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(exchanges.map((ex) => ex.id));
        }
    };

    // ✅ 삭제 기능
    const handleDelete = async () => {
        if (selectedIds.length === 0) {
            alert("삭제할 항목을 선택하세요.");
            return;
        }
        if (!confirm("선택한 거래소를 삭제하시겠습니까?")) return;

        try {
            const res = await fetch("/api/admin/partnersDelete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selectedIds }),
            });

            if (res.ok) {
                alert("삭제가 완료되었습니다.");
                setExchanges((prev) =>
                    prev.filter((ex) => !selectedIds.includes(ex.id))
                );
                setSelectedIds([]);
            } else {
                const data = await res.json();
                alert(data.message || "삭제 실패");
            }
        } catch (err) {
            console.error("삭제 요청 오류:", err);
            alert("서버 오류가 발생했습니다.");
        }
    };

    const handleRegister = () => {
        router.push("/admin/adminPartnersNew");
    };

    return (
        <section className="bg-white py-16 border-t border-gray-100 mt-[100px]">
            <div className="max-w-6xl mx-auto px-6">
                {/* 제목 + 버튼 */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <List className="w-6 h-6 text-orange-500" />
                        거래소 관리
                    </h2>

                    {/* 버튼 영역 */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleRegister}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium text-sm transition"
                        >
                            <Plus className="w-4 h-4" /> 등록
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium text-sm transition"
                        >
                            <Trash2 className="w-4 h-4" /> 삭제
                        </button>
                    </div>
                </div>

                {/* ✅ 리스트 테이블 */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-gray-700 border-t border-gray-200">
                        <thead>
                        <tr className="text-gray-500 border-b bg-gray-50">
                            <th className="py-3 px-3 text-center">
                                <input
                                    type="checkbox"
                                    checked={
                                        selectedIds.length > 0 &&
                                        selectedIds.length === exchanges.length
                                    }
                                    onChange={toggleAll}
                                />
                            </th>
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
                                    className={`border-b hover:bg-orange-50 transition ${
                                        selectedIds.includes(ex.id)
                                            ? "bg-orange-50"
                                            : ""
                                    }`}
                                >
                                    {/* ✅ 개별 체크박스 */}
                                    <td className="text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(ex.id)}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                toggleSelect(ex.id);
                                            }}
                                        />
                                    </td>

                                    {/* ✅ 거래소명 클릭 시 수정 페이지 이동 */}
                                    <td
                                        className="py-3 px-2 flex items-center gap-3 cursor-pointer"
                                        onClick={() =>
                                            router.push(
                                                `/admin/adminPartnersEdit?id=${ex.id}`
                                            )
                                        }
                                    >
                                        <img
                                            src={ex.logo}
                                            alt={ex.name}
                                            className="h-8 w-8 rounded-full border"
                                        />
                                        <div>
                                            <div className="font-medium text-gray-800 hover:text-orange-600 transition">
                                                {ex.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {ex.tag}
                                            </div>
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
            </div>
        </section>
    );
}
