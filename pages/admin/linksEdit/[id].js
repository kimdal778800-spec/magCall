"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function Id() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    const [formData, setFormData] = useState({
        id: "",
        name: "",
        url: "",
        image: "",
    });
    const [originalData, setOriginalData] = useState(null); // ✅ 복원용 원본 데이터
    const [preview, setPreview] = useState(null);
    const [newImage, setNewImage] = useState(null);

    // ✅ 데이터 로드
    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const res = await fetch(`/api/admin/linksList`, {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();

                const link = data.links.find((l) => l.id === Number(id));
                if (link) {
                    setFormData(link);
                    setOriginalData(link); // ✅ 원본 저장
                }
            } catch (err) {
                console.error("링크 데이터 불러오기 오류:", err);
            }
        };
        fetchData();
    }, [id]);

    // ✅ 이미지 선택 시 미리보기
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setNewImage(file);
        setPreview(URL.createObjectURL(file));
    };

    // ✅ 입력 값 변경
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ✅ 수정 저장
    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = new FormData();
        form.append("id", id);
        form.append("name", formData.name);
        form.append("url", formData.url);
        form.append("oldImage", formData.image);
        if (newImage) form.append("image", newImage);

        try {
            const res = await fetch("/api/admin/linksUpdate", {
                method: "POST",
                body: form,
                credentials: "include",
            });

            if (res.ok) {
                alert("링크 수정이 완료되었습니다!");
                router.push("../links"); // ✅ /admin/links 이동
            } else {
                const data = await res.json();
                alert(data.message || "수정 실패");
            }
        } catch (err) {
            console.error("수정 요청 오류:", err);
            alert("서버 오류가 발생했습니다.");
        }
    };

    // ✅ 단일 삭제
    const handleDelete = async () => {
        if (!confirm("정말 이 링크를 삭제하시겠습니까?")) return;

        try {
            const res = await fetch("/api/admin/linksDelete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ ids: [Number(id)] }),
            });

            if (res.ok) {
                alert("링크가 삭제되었습니다!");
                router.push("../links");
            } else {
                const data = await res.json();
                alert(data.message || "삭제 실패");
            }
        } catch (err) {
            console.error("삭제 요청 오류:", err);
            alert("서버 오류가 발생했습니다.");
        }
    };

    // ✅ 뒤로 가기
    const handleBack = () => {
        router.push("../links");
    };

    // ✅ 이미지 다운로드
    const handleDownload = () => {
        const a = document.createElement("a");
        a.href = formData.image;
        a.download = formData.image.split("/").pop(); // 파일명 추출
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // ✅ 수정 취소 (복원)
    const handleCancelChanges = () => {
        if (!originalData) return;
        setFormData(originalData);
        setPreview(null);
        setNewImage(null);
        alert("수정 내용이 원래대로 복원되었습니다.");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8 md:p-10">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
                    ✏️ 링크 수정
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 이미지명 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            이미지명
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        />
                    </div>

                    {/* URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            URL
                        </label>
                        <input
                            type="text"
                            name="url"
                            value={formData.url}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        />
                    </div>

                    {/* 이미지 미리보기 / 교체 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            이미지 파일
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer p-2"
                        />
                        <div className="mt-4 text-center">
                            <img
                                src={preview || formData.image}
                                alt="미리보기"
                                className="w-full h-48 object-cover rounded-md border"
                            />
                        </div>
                    </div>

                    {/* 버튼 그룹 */}
                    <div className="flex flex-col gap-3 mt-8">
                        <button
                            type="submit"
                            className="w-full bg-orange-500 text-white py-2.5 rounded-md font-semibold hover:bg-orange-600 transition"
                        >
                            💾 수정 저장
                        </button>

                        <button
                            type="button"
                            onClick={handleCancelChanges}
                            className="w-full bg-yellow-400 text-gray-800 py-2.5 rounded-md font-semibold hover:bg-yellow-500 transition"
                        >
                            ↩ 수정 취소 (복원)
                        </button>

                        <button
                            type="button"
                            onClick={handleDownload}
                            className="w-full bg-blue-500 text-white py-2.5 rounded-md font-semibold hover:bg-blue-600 transition"
                        >
                            📥 이미지 다운로드
                        </button>

                        <button
                            type="button"
                            onClick={handleDelete}
                            className="w-full bg-red-500 text-white py-2.5 rounded-md font-semibold hover:bg-red-600 transition"
                        >
                            🗑 삭제
                        </button>

                        <button
                            type="button"
                            onClick={handleBack}
                            className="w-full bg-gray-200 text-gray-800 py-2.5 rounded-md font-semibold hover:bg-gray-300 transition"
                        >
                            ⬅ 돌아가기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
