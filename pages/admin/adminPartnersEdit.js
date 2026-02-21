"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import DOMPurify from "dompurify";
import "react-quill/dist/quill.snow.css";
import { ArrowLeft, Save, X } from "lucide-react";
import { useModal } from "@/context/ModalContext";

// ✅ react-quill은 클라이언트 전용으로 로드 (SSR 차단)
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function PartnersEdit() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [formData, setFormData] = useState({
        name: "",
        logo: "",
        rate: "",
        discount: "",
        fee1: "",
        fee2: "",
        tag: "",
        description: "",
    });

    const [preview, setPreview] = useState(null);
    const [uploadedPath, setUploadedPath] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showModal } = useModal();
    const fileInputRef = useRef(null);
    const quillRef = useRef(null);

    // 툴바/포맷은 클라이언트에서만 세팅
    const [modules, setModules] = useState();
    const [formats, setFormats] = useState();

    // ✅ Quill 확장(폰트/사이즈/색상 등)은 quill 패키지에서 직접 import 후 등록
    useEffect(() => {
        if (typeof window === "undefined") return;

        (async () => {
            // react-quill이 아니라 quill에서 직접 로드
            const Quill = (await import("quill")).default;

            // 폰트/사이즈/색상 attributors 등록
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
                    // ✅ 여기서 image: imageHandler 연결
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ✅ 데이터 로드
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/admin/partnerExchanges?id=${id}`);
                const data = await res.json();
                if (res.ok && data.exchange) {
                    setFormData(data.exchange);
                    setPreview(data.exchange.logo);
                    setUploadedPath(data.exchange.logo);
                } else {
                    await showModal("데이터를 불러오지 못했습니다.", "error");
                    router.push("/admin/adminPartnerList");
                }
            } catch (err) {
                console.error("데이터 로드 오류:", err);
                await showModal("서버 오류가 발생했습니다.", "error");
            }
        };
        if (id) fetchData();
    }, [id, router]);

    // 입력 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handlePercentInput = (e) => {
        const { name, value } = e.target;
        const numeric = value.replace(/[^0-9.]/g, "");
        const withPercent = numeric ? numeric + "%" : "";
        setFormData((prev) => ({ ...prev, [name]: withPercent }));
    };

    // 이미지 업로드
    const handleFileChange = async (e) => {
        const selected = e.target.files[0];
        if (!selected) return;
        setPreview(URL.createObjectURL(selected));

        const uploadForm = new FormData();
        uploadForm.append("image", selected);

        try {
            const res = await fetch("/api/admin/partnerImageUpload", {
                method: "POST",
                body: uploadForm,
            });
            const data = await res.json();

            if (res.ok) {
                setUploadedPath(data.filePath);
                setFormData((prev) => ({ ...prev, logo: data.filePath }));
            } else {
                await showModal(data.message || "이미지 업로드 실패", "error");
                setPreview(null);
            }
        } catch (err) {
            console.error("업로드 오류:", err);
        }
    };

    // 이미지 삭제
    const handleRemoveImage = async () => {
        try {
            if (uploadedPath) {
                await fetch("/api/admin/partnerImageDelete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ filePath: uploadedPath }),
                });
            }
        } catch (err) {
            console.error("이미지 삭제 오류:", err);
        }

        setPreview(null);
        setUploadedPath(null);
        setFormData((prev) => ({ ...prev, logo: "" }));
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Quill 이미지 업로드 핸들러
    // ✅ 화살표 함수가 아닌 function() { } 로 작성해야 this.quill 사용 가능
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
                // ✅ this.quill 로 Quill 인스턴스 접근
                const quill = this.quill;
                const range = quill.getSelection(true);
                quill.insertEmbed(range.index, "image", data.url);
                quill.setSelection(range.index + 1);
            } else {
                await showModal(data.message || "이미지 업로드 실패", "error");
            }
        };
    };


    // 수정 처리
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const safeHTML = DOMPurify.sanitize(formData.description);

        try {
            const res = await fetch("/api/admin/partnersUpdate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, ...formData, description: safeHTML }),
            });

            const data = await res.json();
            if (res.ok) {
                await showModal("거래소 정보가 성공적으로 수정되었습니다!", "success");
                router.push("/admin/adminPartnerList");
            } else {
                await showModal(data.message || "수정 중 오류 발생", "error");
            }
        } catch (err) {
            console.error("수정 오류:", err);
            await showModal("서버 오류 발생", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="bg-white min-h-screen py-16 mt-[90px]">
            <div className="max-w-4xl mx-auto px-6">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">거래소 수정</h2>
                    <button
                        onClick={() => router.push("/admin/adminPartnerList")}
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
                    {/* 거래소명 */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">거래소명 *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* 로고 업로드 */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">로고 이미지 *</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="block text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0 file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                            />
                            {preview && (
                                <div className="relative inline-block mt-3">
                                    <img
                                        src={preview}
                                        alt="미리보기"
                                        className="h-20 w-20 rounded-md object-cover border border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-500 transition"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>


                    {/* 퍼센트/수수료/태그 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">페이백 (%)</label>
                            <input
                                type="text"
                                name="rate"
                                value={formData.rate}
                                onChange={handlePercentInput}
                                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">할인 (%)</label>
                            <input
                                type="text"
                                name="discount"
                                value={formData.discount}
                                onChange={handlePercentInput}
                                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">지정가 수수료</label>
                            <input
                                type="text"
                                name="fee1"
                                value={formData.fee1}
                                onChange={handlePercentInput}
                                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">시장가 수수료</label>
                            <input
                                type="text"
                                name="fee2"
                                value={formData.fee2}
                                onChange={handlePercentInput}
                                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">태그</label>
                        <input
                            type="text"
                            name="tag"
                            value={formData.tag}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* 거래소 설명 (확장 툴바) */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">거래소 설명</label>
                        {modules && formats && (
                            <ReactQuill
                                ref={quillRef}
                                value={formData.description}
                                onChange={(value) =>
                                    setFormData((prev) => ({ ...prev, description: value }))
                                }
                                modules={modules}
                                formats={formats}
                                theme="snow"
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
                            onClick={() => router.push("/admin/adminPartnerList")}
                            className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex items-center gap-2 px-5 py-2 rounded-md text-white font-semibold transition ${
                                isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            <Save className="w-4 h-4" />
                            {isSubmitting ? "수정 중..." : "수정 완료"}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
