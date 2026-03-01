import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { REGIONS } from "@/components/ShopsSection";
import { useModal } from "@/context/ModalContext";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

const CATEGORY_TABS = [
    { code: "massage", label: "출장마사지" },
    { code: "theme", label: "테마별샵" },
];

const THEME_TYPES = [
    { code: "korean", label: "한국" },
    { code: "japanese", label: "일본/혼혈" },
    { code: "thai", label: "태국" },
    { code: "chinese", label: "중국" },
    { code: "todaki", label: "토닥이" },
];

const quillToolbar = [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
];

export default function ShopsNew() {
    const router = useRouter();
    const { showModal } = useModal();
    const quillRef = useRef(null);

    const [name, setName] = useState("");
    const [category, setCategory] = useState("massage");
    const [themeType, setThemeType] = useState("");
    const [region, setRegion] = useState("");
    const [subRegion, setSubRegion] = useState("");
    const [phone, setPhone] = useState("");
    const [telegram, setTelegram] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [description, setDescription] = useState("");
    const [isSpecial, setIsSpecial] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // 각 필드 ref (포커스/스크롤용)
    const nameRef      = useRef(null);
    const themeRef     = useRef(null);
    const regionRef    = useRef(null);
    const subRegionRef = useRef(null);
    const phoneRef     = useRef(null);

    const currentRegion = REGIONS.find((r) => r.code === region);

    const handleCategoryChange = (code) => {
        setCategory(code);
        if (code !== "theme") setThemeType("");
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleRegionChange = (e) => {
        setRegion(e.target.value);
        setSubRegion("");
        clearError("region");
    };

    const handlePhoneChange = (e) => {
        setPhone(e.target.value.replace(/\D/g, "").slice(0, 12));
        clearError("phone");
    };

    const clearError = (field) => {
        setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    };

    // 유효성 오류 시: 모달 + 스크롤 + 강조
    const showFieldError = async (message, ref, field) => {
        // 강조 클래스 추가
        setErrors((prev) => ({ ...prev, [field]: true }));
        // 해당 필드로 스크롤
        ref?.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        ref?.current?.focus?.();
        // 모달 표시
        await showModal(message, "warning");
        // 강조 해제
        setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
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
            } catch {
                await showModal("이미지 업로드에 실패했습니다.", "error");
            }
        };
    }, [showModal]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) {
            await showFieldError("업체명을 입력해주세요.", nameRef, "name");
            return;
        }
        if (category === "theme" && !themeType) {
            await showFieldError("테마 종류를 선택해주세요.", themeRef, "themeType");
            return;
        }
        if (!region) {
            await showFieldError("지역을 선택해주세요.", regionRef, "region");
            return;
        }
        if (currentRegion && currentRegion.subs.length > 0 && !subRegion) {
            await showFieldError("상세 지역을 선택해주세요.", subRegionRef, "subRegion");
            return;
        }
        if (phone && !/^0\d{8,11}$/.test(phone)) {
            await showFieldError("올바른 전화번호를 입력해주세요.\n(예: 01012345678, 050012345678)", phoneRef, "phone");
            return;
        }
        setSubmitting(true);

        const form = new FormData();
        form.append("name", name);
        form.append("category", category);
        form.append("theme_type", themeType);
        form.append("region", region);
        form.append("sub_region", subRegion);
        form.append("phone", phone);
        form.append("telegram", telegram);
        form.append("description", description);
        form.append("is_special", isSpecial ? "true" : "false");
        if (imageFile) form.append("image", imageFile);

        try {
            const res = await fetch("/api/admin/shopsAdd", { method: "POST", body: form });
            const data = await res.json();
            if (res.ok) {
                await showModal("업체가 등록되었습니다!", "success");
                router.push("/admin/ShopsList");
            } else {
                await showModal(data.message || "등록 실패", "error");
            }
        } catch (err) {
            console.error(err);
            await showModal("서버 오류가 발생했습니다.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const errCls = (field) =>
        errors[field] ? "field-error" : "";

    return (
        <div className="min-h-screen bg-gray-50 pt-[90px] pb-16 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">출장마사지 글쓰기</h1>
                    <button onClick={() => router.push("/admin/ShopsList")} className="text-sm text-gray-500 hover:text-gray-800">
                        ← 목록
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 카테고리 탭 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">카테고리 *</label>
                        <div className="flex gap-3">
                            {CATEGORY_TABS.map((tab) => (
                                <button
                                    key={tab.code}
                                    type="button"
                                    onClick={() => handleCategoryChange(tab.code)}
                                    className={`flex-1 py-2.5 rounded-xl font-semibold text-sm border-2 transition-all ${
                                        category === tab.code
                                            ? "bg-pink-500 border-pink-500 text-white shadow-sm"
                                            : "bg-white border-gray-300 text-gray-600 hover:border-pink-400 hover:text-pink-500"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 스페셜 픽 */}
                    <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSpecial ? "border-yellow-400 bg-yellow-50" : "border-gray-200 bg-white hover:border-yellow-300"
                    }`}>
                        <input
                            type="checkbox"
                            checked={isSpecial}
                            onChange={(e) => setIsSpecial(e.target.checked)}
                            className="sr-only"
                        />
                        <span className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                            isSpecial ? "bg-yellow-400 border-yellow-400" : "border-gray-300 bg-white"
                        }`}>
                            {isSpecial && (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                                </svg>
                            )}
                        </span>
                        <div>
                            <span className="font-bold text-sm text-gray-800 flex items-center gap-1">
                                ⭐ 스페셜 픽
                            </span>
                            <span className="text-xs text-gray-400 mt-0.5 block">체크 시 스페셜 픽으로 표시됩니다.</span>
                        </div>
                    </label>

                    {/* 테마 종류 */}
                    {category === "theme" && (
                        <div ref={themeRef}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                테마 종류 <span className="text-pink-500">*</span>
                            </label>
                            <div className={`flex flex-wrap gap-2 p-2 rounded-lg transition-all ${errCls("themeType")}`}>
                                {THEME_TYPES.map((t) => (
                                    <button
                                        key={t.code}
                                        type="button"
                                        onClick={() => { setThemeType(t.code); clearError("themeType"); }}
                                        className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                                            themeType === t.code
                                                ? "bg-purple-500 border-purple-500 text-white shadow-sm"
                                                : "bg-white border-gray-300 text-gray-600 hover:border-purple-400 hover:text-purple-500"
                                        }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 업체명 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">업체명 *</label>
                        <input
                            ref={nameRef}
                            type="text" value={name}
                            onChange={(e) => { setName(e.target.value); clearError("name"); }}
                            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-400 outline-none transition-all ${errCls("name") || "border-gray-300"}`}
                            placeholder="업체명을 입력하세요"
                        />
                    </div>

                    {/* 지역 + 상세지역 */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                지역 <span className="text-pink-500">*</span>
                            </label>
                            <select
                                ref={regionRef}
                                value={region} onChange={handleRegionChange}
                                className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-400 outline-none transition-all ${errCls("region") || "border-gray-300"}`}
                            >
                                <option value="">선택</option>
                                {REGIONS.filter((r) => r.code !== "all").map((r) => (
                                    <option key={r.code} value={r.code}>{r.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                상세 지역 <span className="text-pink-500">*</span>
                            </label>
                            <select
                                ref={subRegionRef}
                                value={subRegion}
                                onChange={(e) => { setSubRegion(e.target.value); clearError("subRegion"); }}
                                className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-400 outline-none disabled:bg-gray-100 disabled:text-gray-400 transition-all ${errCls("subRegion") || "border-gray-300"}`}
                                disabled={!currentRegion || currentRegion.subs.length === 0}
                            >
                                <option value="">선택</option>
                                <option value="all">전체지역</option>
                                {currentRegion?.subs.map((s) => (
                                    <option key={s.code} value={s.code}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 전화번호 + 텔레그램 */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                            <input
                                ref={phoneRef}
                                type="tel" value={phone} onChange={handlePhoneChange}
                                className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-400 outline-none transition-all ${errCls("phone") || "border-gray-300"}`}
                                placeholder="01012345678"
                                maxLength={12}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">텔레그램 아이디</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">@</span>
                                <input
                                    type="text" value={telegram}
                                    onChange={(e) => setTelegram(e.target.value.replace(/^@+/, ""))}
                                    className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-2 focus:ring-2 focus:ring-pink-400 outline-none"
                                    placeholder="telegram_id"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 대표 이미지 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">대표 이미지</label>
                        <input
                            type="file" accept="image/*" onChange={handleImageChange}
                            className="block w-full text-sm text-gray-600 border border-gray-300 rounded-md p-2 cursor-pointer"
                        />
                        {preview && (
                            <div className="mt-3 w-32 aspect-[3/4] overflow-hidden rounded-xl border border-gray-200">
                                <img src={preview} alt="미리보기" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    {/* 본문 에디터 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">본문 내용</label>
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
                                placeholder="업체 소개, 서비스 내용 등을 입력하세요."
                                style={{ minHeight: "260px" }}
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
                            type="button" onClick={() => router.push("/admin/ShopsList")}
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
