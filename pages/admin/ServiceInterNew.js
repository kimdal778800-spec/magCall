"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import DOMPurify from "dompurify";
import "react-quill/dist/quill.snow.css";
import { ArrowLeft, Save } from "lucide-react";
import { useModal } from "@/context/ModalContext";

// ✅ SSR 오류 방지용 동적 import
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function ServiceInterNew() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showModal } = useModal();
    const [modules, setModules] = useState();
    const [formats, setFormats] = useState();

    // ✅ Quill 설정 (폰트, 크기, 색상, 이미지 업로드 포함)
    useEffect(() => {
        if (typeof window === "undefined") return;

        (async () => {
            const Quill = (await import("quill")).default;

            const Font = Quill.import("formats/font");
            Font.whitelist = ["sans", "serif", "monospace", "arial", "times-new-roman"];
            Quill.register(Font, true);

            const Size = Quill.import("attributors/style/size");
            Size.whitelist = ["small", "normal", "large", "huge"];
            Quill.register(Size, true);

            const Color = Quill.import("attributors/style/color");
            Quill.register(Color, true);

            const Background = Quill.import("attributors/style/background");
            Quill.register(Background, true);

            // ✅ 이미지 업로드 핸들러
            const imageHandler = function () {
                const input = document.createElement("input");
                input.setAttribute("type", "file");
                input.setAttribute("accept", "image/*");
                input.click();

                input.onchange = async () => {
                    const file = input.files?.[0];
                    if (!file) return;

                    const formData = new FormData();
                    formData.append("image", file);

                    const res = await fetch("/api/admin/uploadEditorImage", {
                        method: "POST",
                        body: formData,
                    });
                    const data = await res.json();

                    if (res.ok) {
                        const quill = this.quill;
                        const range = quill.getSelection(true);
                        quill.insertEmbed(range.index, "image", data.url);
                        quill.setSelection(range.index + 1);
                    } else {
                        await showModal(data.message || "이미지 업로드 실패", "error");
                    }
                };
            };

            setModules({
                toolbar: {
                    container: [
                        [{ font: Font.whitelist }],
                        [{ size: Size.whitelist }],
                        ["bold", "italic", "underline", "strike"],
                        [{ color: [] }, { background: [] }],
                        [{ align: [] }],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["link", "image"],
                        ["clean"],
                    ],
                    handlers: { image: imageHandler },
                },
            });

            setFormats([
                "font",
                "size",
                "bold",
                "italic",
                "underline",
                "strike",
                "color",
                "background",
                "align",
                "list",
                "bullet",
                "link",
                "image",
            ]);
        })();
    }, []);

    // ✅ 입력 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // ✅ 등록 처리
    const handleSubmit = async (e) => {
        e.preventDefault();
        const safeHTML = DOMPurify.sanitize(formData.description);

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/admin/servideInterAdd", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, description: safeHTML }),
            });

            const data = await res.json();
            if (res.ok) {
                await showModal("서비스 소개가 성공적으로 등록되었습니다!", "success");
                router.push("/admin/ServiceInter");
            } else {
                await showModal(data.message || "등록 중 오류가 발생했습니다.", "error");
            }
        } catch (err) {
            console.error("등록 오류:", err);
            await showModal("서버 오류 발생", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="bg-white min-h-screen py-16 mt-[90px]">
            <div className="max-w-4xl mx-auto px-6">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">서비스 소개 등록</h2>
                    <button
                        onClick={() => router.push("/admin/ServiceInter")}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        목록으로
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-6"
                >
                    {/* 서비스 이름 */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            서비스 소개 명 *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* ✅ 서비스 설명 에디터 */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">서비스 설명</label>
                        {modules && formats && (
                            <ReactQuill
                                value={formData.description}
                                onChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
                                modules={modules}
                                formats={formats}
                                theme="snow"
                                style={{ minHeight: "300px" }}
                            />
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                            (입력 내용에 따라 자동으로 높이가 늘어납니다.)
                        </p>
                    </div>

                    {/* 버튼 */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => router.push("/admin/ServiceInter")}
                            className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex items-center gap-2 px-5 py-2 rounded-md text-white font-semibold transition ${
                                isSubmitting
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            <Save className="w-4 h-4" />
                            {isSubmitting ? "등록 중..." : "등록"}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
