"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function NewLinkPage() {
    const [name, setName] = useState("");
    const [content, setContent] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [createdAt, setCreatedAt] = useState(
        new Date().toISOString().split("T")[0]
    );
    const quillRef = useRef(null);
    const router = useRouter();
    const { showModal } = useModal();

    // Quill 에디터: 이미지 툴바 버튼 + 붙여넣기 처리
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!quillRef.current) return;
            const quill = quillRef.current.getEditor();

            // 툴바 이미지 버튼 → 파일 선택
            quill.getModule("toolbar").addHandler("image", () => {
                document.getElementById("quill-img-input-new").click();
            });

            // 이미지 붙여넣기(Ctrl+V) 처리
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
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !imageFile) {
            await showModal("제목과 슬라이드 대표 이미지를 입력해주세요!", "warning");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("content", content);
        formData.append("createdAt", createdAt);
        formData.append("image", imageFile);

        try {
            const res = await fetch("/api/admin/linksUpload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                await showModal("링크가 성공적으로 등록되었습니다!", "success");
                router.push("/admin/links", { scroll: false });
            } else {
                await showModal(data.message || "업로드 실패", "error");
            }
        } catch (err) {
            console.error("업로드 오류:", err);
            await showModal("서버 오류가 발생했습니다.", "error");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-8 md:p-10">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
                    슬라이드 글 작성
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 제목 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            제목
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="제목"
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
                            required
                        />

                        {/* 슬라이드 미리보기 */}
                        {preview && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-500 mb-2 text-center">슬라이드 미리보기</p>
                                <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 shadow-md bg-black" style={{ aspectRatio: "16/9" }}>
                                    <img
                                        src={preview}
                                        alt="슬라이드 미리보기"
                                        className="w-full h-full object-cover opacity-90"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
                                        <p className="text-white text-sm font-semibold truncate">
                                            {name || "제목"}
                                        </p>
                                    </div>
                                    <div className="absolute bottom-2 right-3 flex gap-1">
                                        <span className="w-2 h-2 rounded-full bg-white opacity-90 inline-block"></span>
                                        <span className="w-2 h-2 rounded-full bg-white/40 inline-block"></span>
                                        <span className="w-2 h-2 rounded-full bg-white/40 inline-block"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 내용 에디터 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            내용
                        </label>
                        {/* 툴바 이미지 버튼용 숨긴 파일 입력 */}
                        <input
                            id="quill-img-input-new"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleEditorImageSelect}
                        />
                        <div className="border border-gray-300 rounded-md overflow-hidden">
                            <ReactQuill
                                forwardedRef={quillRef}
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={QUILL_MODULES}
                                placeholder="내용을 입력하세요. 이미지는 툴바 이미지 버튼 또는 Ctrl+V 붙여넣기로 삽입할 수 있습니다."
                                style={{ minHeight: "200px" }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            이미지 붙여넣기(Ctrl+V) 또는 툴바 이미지 버튼으로 삽입 가능합니다.
                        </p>
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
