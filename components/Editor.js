"use client";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { useRef, useCallback, useEffect } from "react";

const ReactQuill = dynamic(() => import("react-quill"), {
    ssr: false,
    loading: () => <div>에디터 로딩 중...</div>,
});

async function uploadToServer(file) {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch("/api/admin/uploadEditorImage", {
        method: "POST",
        body: formData,
    });
    if (!res.ok) throw new Error("업로드 실패");
    const data = await res.json();
    return data.url;
}

async function downloadExternalImage(url) {
    const res = await fetch("/api/admin/downloadExternalImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
    });
    if (!res.ok) throw new Error("다운로드 실패");
    const data = await res.json();
    return data.url;
}

export default function Editor({ value, onChange }) {
    const quillRef = useRef(null);

    const imageHandler = useCallback(() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".jpg,.jpeg,.png,.webp";
        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;
            try {
                const url = await uploadToServer(file);
                const quill = quillRef.current.getEditor();
                const range = quill.getSelection(true);
                quill.insertEmbed(range.index, "image", url);
                quill.setSelection(range.index + 1);
            } catch {
                alert("이미지 업로드에 실패했습니다.");
            }
        };
        input.click();
    }, []);

    useEffect(() => {
        if (!quillRef.current) return;
        const quill = quillRef.current.getEditor();

        const handlePaste = async (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            // 클립보드에서 이미지 파일 감지 (타사이트 이미지 복사 시)
            for (const item of items) {
                if (item.type.startsWith("image/")) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    if (!file) continue;
                    try {
                        const url = await uploadToServer(file);
                        const range = quill.getSelection(true);
                        const index = range ? range.index : 0;
                        quill.insertEmbed(index, "image", url);
                        quill.setSelection(index + 1);
                    } catch {
                        alert("이미지 업로드에 실패했습니다.");
                    }
                    return;
                }
            }

            // HTML 붙여넣기 중 외부 img src URL 감지
            const html = e.clipboardData.getData("text/html");
            if (html) {
                const srcMatches = [...html.matchAll(/<img[^>]+src="(https?:\/\/[^"]+)"/g)];
                if (srcMatches.length > 0) {
                    e.preventDefault();
                    const quillEditor = quill;
                    for (const match of srcMatches) {
                        const externalUrl = match[1];
                        try {
                            const localUrl = await downloadExternalImage(externalUrl);
                            const range = quillEditor.getSelection(true);
                            const index = range ? range.index : 0;
                            quillEditor.insertEmbed(index, "image", localUrl);
                            quillEditor.setSelection(index + 1);
                        } catch {
                            // 다운로드 실패 시 원본 URL 유지
                            const range = quillEditor.getSelection(true);
                            const index = range ? range.index : 0;
                            quillEditor.insertEmbed(index, "image", externalUrl);
                            quillEditor.setSelection(index + 1);
                        }
                    }
                }
            }
        };

        quill.root.addEventListener("paste", handlePaste);
        return () => quill.root.removeEventListener("paste", handlePaste);
    }, []);

    const modules = {
        toolbar: {
            container: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link", "image"],
                ["clean"],
            ],
            handlers: { image: imageHandler },
        },
    };

    return (
        <div className="border border-gray-300 rounded-md bg-white overflow-hidden">
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                placeholder="상세 설명을 입력하세요..."
            />
        </div>
    );
}
