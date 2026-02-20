"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewLinkPage() {
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [createdAt, setCreatedAt] = useState(
        new Date().toISOString().split("T")[0]
    );

    const router = useRouter();

    // ✅ 이미지 선택 시 미리보기 생성
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    // ✅ 업로드 처리
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !url || !imageFile) {
            alert("모든 필드를 입력해주세요!");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("url", url);
        formData.append("createdAt", createdAt);
        formData.append("image", imageFile);

        try {
            const res = await fetch("/api/admin/linksUpload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                alert("링크가 성공적으로 등록되었습니다!");
                router.push("/admin/links", { scroll: false });
            } else {
                alert(data.message || "업로드 실패");
            }

        } catch (err) {
            console.error("업로드 오류:", err);
            alert("서버 오류가 발생했습니다.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8 md:p-10">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
                   새 링크 작성
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 이미지명 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            이미지명
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="예: 페이백 신청현황"
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
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="https:// 포함 입력"
                            required
                        />
                    </div>

                    {/* 이미지 파일 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            이미지 파일 첨부
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer p-2"
                            required
                        />

                        {/* 미리보기 */}
                        {preview && (
                            <div className="mt-4 text-center">
                                <p className="text-sm text-gray-500 mb-2">미리보기</p>
                                <img
                                    src={preview}
                                    alt="미리보기"
                                    className="w-full h-48 object-cover rounded-md border"
                                />
                            </div>
                        )}
                    </div>

                    {/* 작성일자 (자동) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            작성일자
                        </label>
                        <input
                            type="text"
                            value={createdAt}
                            readOnly
                            className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-gray-600"
                        />
                    </div>

                    {/* 제출 버튼 */}
                    <button
                        type="submit"
                        className="w-full bg-orange-500 text-white py-2.5 rounded-md font-semibold hover:bg-orange-600 transition"
                    >
                        등록하기
                    </button>
                </form>
            </div>
        </div>
    );
}
