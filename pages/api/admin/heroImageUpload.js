import fs from "fs";
import path from "path";
import formidable from "formidable";
import { requireAdmin } from "@/lib/adminAuth";

export const config = {
    api: { bodyParser: false },
};

export default async function handler(req, res) {
    if (req.method !== "POST")
        return res.status(405).json({ message: "Method not allowed" });

    if (!requireAdmin(req, res)) return;

    const uploadDir = path.join(process.cwd(), "public", "images");

    const form = formidable({
        multiples: false,
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024, // 5MB
        uploadDir,
    });

    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(500).json({ message: "파일 업로드 오류" });
        }

        const fileArray = files.image;
        const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

        if (!file) return res.status(400).json({ message: "파일이 없습니다." });

        const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
        const ext = path.extname(file.originalFilename || "").toLowerCase();
        if (!allowedExtensions.includes(ext)) {
            if (fs.existsSync(file.filepath)) fs.unlinkSync(file.filepath);
            return res.status(400).json({ message: "jpg, jpeg, png, webp 파일만 허용됩니다." });
        }

        // slot 값으로 hero1 또는 hero2 결정
        const slot = (Array.isArray(fields.slot) ? fields.slot[0] : fields.slot) || "1";
        const saveName = `hero${slot}${ext}`;
        const savePath = path.join(uploadDir, saveName);

        // 기존 hero 이미지 삭제 (다른 확장자)
        ["jpg", "jpeg", "png", "webp"].forEach((e) => {
            const old = path.join(uploadDir, `hero${slot}.${e}`);
            if (fs.existsSync(old)) fs.unlinkSync(old);
        });

        fs.renameSync(file.filepath, savePath);

        return res.status(200).json({
            message: "업로드 성공",
            filePath: `/images/${saveName}`,
        });
    });
}
