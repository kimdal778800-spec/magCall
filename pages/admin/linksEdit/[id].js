"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { useModal } from "@/context/ModalContext";

const ReactQuill = dynamic(
    async () => {
        const { default: RQ } = await import("react-quill");
        return function QuillWrapper({ forwardedRef, ...props }) {
            return <RQ ref={forwardedRef} {...props} />;
        };
    },
    {
        ssr: false,
        loading: () => (
            <div className="border border-gray-300 rounded-md p-4 text-gray-400 text-sm text-center">
                에디터 로딩 중...
            </div>
        ),
    }
);

const QUILL_MODULES = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ color: [] }, { background: [] }],
        ["link", "image"],
        ["clean"],
    ],
};

export default function Id() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    const [formData, setFormData] = useState({
        id: "",
        name: "",
        content: "",
        image: "",
    });
    const [originalData, setOriginalData] = useState(null);
    const [preview, setPreview] = useState(null);
    const [newImage, setNewImage] = useState(null);
    const quillRef = useRef(null);
    const { showModal } = useModal();

    // 데이터 로드
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
                    setOriginalData(link);
                }
            } catch (err) {
                console.error("링크 데이터 불러오기 오류:", err);
            }
        };
        fetchData();
    }, [id]);

    // Quill 에디터: 이미지 툴바 버튼 + 붙여넣기 처리
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!quillRef.current) return;
            const quill = quillRef.current.getEditor();

            quill.getModule("toolbar").addHandler("image", () => {
                document.getElementById("quill-img-input-edit").click();
            });

            const handlePaste = async (e) => {
                const items = e.clipboardData?.items;
                if (!items) return;
                for (const item of Array.from(items)) {
                    if (item.type.startsWith("image/")) {
                        e.preventDefault();
                        const file = item.getAsFile();
                        if (!file) continue;
                        await uploadAndInsert(quill, file);
                    }
                }
            };

            quill.root.addEventListener("paste", handlePaste);
            quill._pasteHandler = handlePaste;
        }, 300);

        return () => {
            clearTimeout(timer);
            if (quillRef.current) {
                try {
                    const quill = quillRef.current.getEditor();
                    if (quill._pasteHandler) {
                        quill.root.removeEventListener("paste", quill._pasteHandler);
                    }
                } catch {}
            }
        };
    }, []);

    const uploadAndInsert = async (quill, file) => {
        const formData = new FormData();
        formData.append("image", file);
        try {
            const res = await fetch("/api/admin/uploadEditorImage", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            const range = quill.getSelection(true);
            const insertIndex = range ? range.index : quill.getLength();
            quill.insertEmbed(insertIndex, "image", data.url);
            quill.setSelection(insertIndex + 1);
        } catch (err) {
            console.error("이미지 업로드 오류:", err);
            await showModal("이미지 업로드에 실패했습니다.", "error");
        }
    };

    const handleEditorImageSelect = async (e) => {
        const file = e.target.files[0];
        if (!file || !quillRef.current) return;
        const quill = quillRef.current.getEditor();
        await uploadAndInsert(quill, file);
        e.target.value = "";
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setNewImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = new FormData();
        form.append("id", id);
        form.append("name", formData.name);
        form.append("content", formData.content || "");
        form.append("oldImage", formData.image);
        if (newImage) form.append("image", newImage);

        try {
            const res = await fetch("/api/admin/linksUpdate", {
                method: "POST",
                body: form,
                credentials: "include",
            });
            if (res.ok) {
                await showModal("링크 수정이 완료되었습니다!", "success");
                router.push("../links");
            } else {
                const data = await res.json();
                await showModal(data.message || "수정 실패", "error");
            }
        } catch (err) {
            console.error("수정 요청 오류:", err);
            await showModal("서버 오류가 발생했습니다.", "error");
        }
    };

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
                await showModal("링크가 삭제되었습니다!", "success");
                router.push("../links");
            } else {
                const data = await res.json();
                await showModal(data.message || "삭제 실패", "error");
            }
        } catch (err) {
            console.error("삭제 요청 오류:", err);
            await showModal("서버 오류가 발생했습니다.", "error");
        }
    };

    const handleBack = () => {
        router.push("../links");
    };

    const handleDownload = () => {
        const a = document.createElement("a");
        a.href = formData.image;
        a.download = formData.image.split("/").pop();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleCancelChanges = async () => {
        if (!originalData) return;
        setFormData(originalData);
        setPreview(null);
        setNewImage(null);
        await showModal("수정 내용이 원래대로 복원되었습니다.", "info");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-8 md:p-10">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
                    ✏️ 슬라이드 수정
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 제목 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            제목
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

                    {/* 슬라이드 대표 이미지 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            슬라이드 대표 이미지
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer p-2"
                        />
                        <div className="mt-4">
                            <p className="text-sm text-gray-500 mb-2 text-center">슬라이드 미리보기</p>
                            <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 shadow-md bg-black" style={{ aspectRatio: "16/9" }}>
                                <img
                                    src={preview || formData.image}
                                    alt="슬라이드 미리보기"
                                    className="w-full h-full object-cover opacity-90"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
                                    <p className="text-white text-sm font-semibold truncate">
                                        {formData.name || "제목"}
                                    </p>
                                </div>
                                <div className="absolute bottom-2 right-3 flex gap-1">
                                    <span className="w-2 h-2 rounded-full bg-white opacity-90 inline-block"></span>
                                    <span className="w-2 h-2 rounded-full bg-white/40 inline-block"></span>
                                    <span className="w-2 h-2 rounded-full bg-white/40 inline-block"></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 내용 에디터 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            내용
                        </label>
                        <input
                            id="quill-img-input-edit"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleEditorImageSelect}
                        />
                        <div className="border border-gray-300 rounded-md overflow-hidden">
                            <ReactQuill
                                forwardedRef={quillRef}
                                theme="snow"
                                value={formData.content || ""}
                                onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
                                modules={QUILL_MODULES}
                                placeholder="내용을 입력하세요. 이미지는 툴바 이미지 버튼 또는 Ctrl+V 붙여넣기로 삽입할 수 있습니다."
                                style={{ minHeight: "200px" }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            이미지 붙여넣기(Ctrl+V) 또는 툴바 이미지 버튼으로 삽입 가능합니다.
                        </p>
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
