"use client";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), {
    ssr: false,
    loading: () => <div>🖋 에디터 로딩 중...</div>,
});

export default function Editor({ value, onChange }) {
    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"],
        ],
    };

    return (
        <div className="border border-gray-300 rounded-md bg-white overflow-hidden">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                placeholder="거래소 상세 설명을 입력하세요..."
            />
        </div>
    );
}
