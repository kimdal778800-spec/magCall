import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { useModal } from "@/context/ModalContext";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const quillToolbar = [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
];

export default function ServiceNew() {
    const router = useRouter();
    const quillRef = useRef(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { showModal } = useModal();

    const imageHandler = useCallback(() => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();
        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;
            const formData = new FormData();
            formData.append("image", file);
            try {
                const res = await fetch("/api/admin/uploadEditorImage", { method: "POST", body: formData });
                const data = await res.json();
                if (data.url) {
                    const editor = quillRef.current.getEditor();
                    const range = editor.getSelection(true);
                    const insertIndex = range ? range.index : editor.getLength();
                    editor.insertEmbed(insertIndex, "image", data.url);
                    editor.setSelection(insertIndex + 1);
                }
            } catch {
                await showModal("이미지 업로드에 실패했습니다.", "error");
            }
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            await showModal("제목을 입력해주세요.", "warning");
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch("/api/admin/serviceAdd", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content }),
            });
            const data = await res.json();
            if (res.ok) {
                await showModal("등록되었습니다!", "success");
                router.push("/service");
            } else {
                await showModal(data.message || "등록 실패", "error");
            }
        } catch {
            await showModal("서버 오류가 발생했습니다.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-[90px] pb-16 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">서비스 소개 등록</h1>
                    <button onClick={() => router.push("/service")} className="text-sm text-gray-500 hover:text-gray-800">
                        ← 목록
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 제목 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
                        <input
                            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-400 outline-none"
                            placeholder="제목을 입력하세요" required
                        />
                    </div>

                    {/* 에디터 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">내용 (이미지 붙여넣기 가능)</label>
                        <div className="border border-gray-300 rounded-xl overflow-hidden">
                            <ReactQuill
                                ref={quillRef}
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={{
                                    toolbar: {
                                        container: quillToolbar,
                                        handlers: { image: imageHandler },
                                    },
                                }}
                                placeholder="내용을 입력하거나 이미지를 붙여넣으세요."
                                style={{ minHeight: "300px" }}
                            />
                        </div>
                    </div>

                    {/* 버튼 */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit" disabled={submitting}
                            className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-2.5 rounded-full font-bold transition disabled:opacity-50"
                        >
                            {submitting ? "등록 중..." : "등록하기"}
                        </button>
                        <button
                            type="button" onClick={() => router.push("/service")}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 rounded-full font-semibold transition"
                        >
                            취소
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
