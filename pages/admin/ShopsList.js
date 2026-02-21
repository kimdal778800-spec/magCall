import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { REGIONS, TABS } from "@/components/ShopsSection";
import { useModal } from "@/context/ModalContext";

const getCategoryLabel = (code) => TABS.find((t) => t.code === code)?.label || code;
const getRegionLabel = (code) => REGIONS.find((r) => r.code === code)?.label || code;
const getSubLabel = (regionCode, subCode) => {
    const r = REGIONS.find((r) => r.code === regionCode);
    return r?.subs.find((s) => s.code === subCode)?.label || subCode;
};

export default function ShopsList() {
    const [shops, setShops] = useState([]);
    const router = useRouter();
    const { showModal } = useModal();

    const fetchShops = async () => {
        try {
            const res = await fetch("/api/admin/shopsList");
            const data = await res.json();
            setShops(data.shops || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchShops(); }, []);

    const handleDelete = async (id) => {
        if (!confirm("이 업체를 삭제하시겠습니까?")) return;
        try {
            const res = await fetch("/api/admin/shopsDelete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (res.ok) {
                await showModal("삭제되었습니다.", "success");
                fetchShops();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-[90px] pb-16 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">업체 관리</h1>
                    <button
                        onClick={() => router.push("/admin/ShopsNew")}
                        className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-full font-bold text-sm transition"
                    >
                        + 업체 등록
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow overflow-hidden">
                    <table className="w-full text-sm text-gray-700">
                        <thead>
                            <tr className="bg-gray-100 text-gray-500 text-xs uppercase">
                                <th className="py-3 px-4 text-left">이미지</th>
                                <th className="py-3 px-4 text-left">업체명</th>
                                <th className="py-3 px-4 text-center">카테고리</th>
                                <th className="py-3 px-4 text-center">지역</th>
                                <th className="py-3 px-4 text-center">전화</th>
                                <th className="py-3 px-4 text-center">등록일</th>
                                <th className="py-3 px-4 text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shops.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-gray-400">
                                        등록된 업체가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                shops.map((shop) => (
                                    <tr key={shop.id} className="border-t hover:bg-gray-50 transition">
                                        <td className="py-3 px-4">
                                            {shop.image ? (
                                                <img src={shop.image} alt={shop.name} className="w-10 h-12 object-cover rounded-lg" />
                                            ) : (
                                                <div className="w-10 h-12 bg-gray-100 rounded-lg" />
                                            )}
                                        </td>
                                        <td className="py-3 px-4 font-medium">{shop.name}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">
                                                {getCategoryLabel(shop.category)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center text-xs text-gray-500">
                                            {getRegionLabel(shop.region)}
                                            {shop.sub_region && ` · ${getSubLabel(shop.region, shop.sub_region)}`}
                                        </td>
                                        <td className="py-3 px-4 text-center text-xs">{shop.phone || "-"}</td>
                                        <td className="py-3 px-4 text-center text-xs text-gray-400">{shop.createdAt}</td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => router.push(`/admin/ShopsEdit/${shop.id}`)}
                                                    className="text-xs text-blue-500 hover:text-blue-700 border border-blue-200 px-2 py-1 rounded transition"
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(shop.id)}
                                                    className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-2 py-1 rounded transition"
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
