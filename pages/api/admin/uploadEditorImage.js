import fs from "fs";
import path from "path";
import formidable from "formidable";
import { requireAdmin } from "@/lib/adminAuth";

export const config = {
    api: { bodyParser: false },
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    if (!requireAdmin(req, res)) return;

    try {
        const uploadDir = path.join(process.cwd(), "public", "images", "EditorImage");

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const form = formidable({
            multiples: false,
            keepExtensions: true,
            uploadDir,
            maxFileSize: 10 * 1024 * 1024,
        });

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error("이미지 업로드 오류:", err);
                return res.status(500).json({ message: "파일 업로드 실패" });
            }

            const file = Array.isArray(files.image) ? files.image[0] : files.image;
            if (!file) return res.status(400).json({ message: "이미지가 없습니다." });

            const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
            const ext = path.extname(file.originalFilename || "").toLowerCase();
            if (!allowedExtensions.includes(ext)) {
                if (fs.existsSync(file.filepath)) fs.unlinkSync(file.filepath);
                return res.status(400).json({ message: "jpg, jpeg, png, webp 파일만 허용됩니다." });
            }

            const publicPath = `/images/EditorImage/${path.basename(file.filepath)}`;
            return res.status(200).json({ url: publicPath });
        });
    } catch (err) {
        console.error("서버 오류:", err);
        return res.status(500).json({ message: "서버 오류 발생" });
    }
}
