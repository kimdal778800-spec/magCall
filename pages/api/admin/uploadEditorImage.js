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
            const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
            const ext = path.extname(file.originalFilename || "").toLowerCase();
            const mime = file.mimetype || "";

            if (!allowedExtensions.includes(ext) && !allowedMimeTypes.includes(mime)) {
                if (fs.existsSync(file.filepath)) fs.unlinkSync(file.filepath);
                return res.status(400).json({ message: "jpg, jpeg, png, webp 파일만 허용됩니다." });
            }

            // 클립보드 붙여넣기 시 확장자가 없으면 MIME 타입으로 보완
            const mimeToExt = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" };
            const finalExt = allowedExtensions.includes(ext) ? ext : (mimeToExt[mime] || ".jpg");
            const baseName = path.basename(file.filepath);
            const hasExt = allowedExtensions.includes(path.extname(baseName).toLowerCase());
            const finalName = hasExt ? baseName : `${baseName}${finalExt}`;

            if (!hasExt) {
                fs.renameSync(file.filepath, path.join(path.dirname(file.filepath), finalName));
            }

            const finalPath = path.join(path.dirname(file.filepath), finalName);
            if (fs.existsSync(finalPath)) fs.chmodSync(finalPath, 0o644);

            const publicPath = `/images/EditorImage/${finalName}`;
            return res.status(200).json({ url: publicPath });
        });
    } catch (err) {
        console.error("서버 오류:", err);
        return res.status(500).json({ message: "서버 오류 발생" });
    }
}
