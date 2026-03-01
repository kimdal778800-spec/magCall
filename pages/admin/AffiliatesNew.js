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

export default function AffiliatesNew() {
    const router = useRouter();
    const quillRef = useRef(null);
    const { showModal } = useModal();
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

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
            } catch (err) {
                console.error("에디터 이미지 삽입 오류:", err);
                await showModal("이미지 업로드에 실패했습니다.", "error");
            }
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) {
            await showModal("사이트명은 필수입니다.", "warning");
            return;
        }
        setSubmitting(true);

        const form = new FormData();
        form.append("name", name);
        form.append("url", url);
        form.append("description", description);
        if (imageFile) form.append("image", imageFile);

        try {
            const res = await fetch("/api/admin/affiliatesAdd", { method: "POST", body: form });
            const data = await res.json();
            if (res.ok) {
                await showModal("등록되었습니다!", "success");
                router.push("/partners");
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
                    <h1 className="text-2xl font-bold text-gray-800">제휴 업소 등록</h1>
                    <button onClick={() => router.push("/partners")} className="text-sm text-gray-500 hover:text-gray-800">
                        ← 목록
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 사이트명 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">사이트명 *</label>
                        <input
                            type="text" value={name} onChange={(e) => setName(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-400 outline-none"
                            placeholder="사이트명을 입력하세요" required
                        />
                    </div>

                    {/* URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">바로가기 URL</label>
                        <input
                            type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-400 outline-none"
                            placeholder="https://example.com"
                        />
                    </div>

                    {/* 대표 이미지 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">대표 이미지</label>
                        <input
                            type="file" accept="image/*" onChange={handleImageChange}
                            className="block w-full text-sm text-gray-600 border border-gray-300 rounded-md p-2 cursor-pointer"
                        />
                        {preview && (
                            <div className="mt-3 w-32 h-32 overflow-hidden rounded-xl border border-gray-200">
                                <img src={preview} alt="미리보기" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    {/* 사이트 소개 에디터 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">사이트 소개</label>
                        <div className="border border-gray-300 rounded-xl overflow-hidden">
                            <ReactQuill
                                ref={quillRef}
                                theme="snow"
                                value={description}
                                onChange={setDescription}
                                modules={{
                                    toolbar: {
                                        container: quillToolbar,
                                        handlers: { image: imageHandler },
                                    },
                                }}
                                placeholder="사이트 소개를 입력하세요."
                                style={{ minHeight: "200px" }}
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
                            type="button" onClick={() => router.push("/partners")}
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
