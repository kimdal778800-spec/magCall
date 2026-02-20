import fs from "fs";
import path from "path";
import formidable from "formidable";

export const config = {
    api: { bodyParser: false }, // ✅ 반드시 false
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const uploadDir = path.join(process.cwd(), "public", "images", "PartnerImage");

        // ✅ 폴더 없으면 자동 생성
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const form = formidable({
            multiples: false,
            keepExtensions: true,
            maxFileSize: 2 * 1024 * 1024, // ✅ 2MB 제한
            uploadDir,
        });

        form.parse(req, (err, fields, files) => {
            if (err) {
                if (err.message.includes("maxFileSize")) {
                    return res.status(400).json({ message: "⚠️ 파일 용량은 2MB 이하만 가능합니다." });
                }
                console.error("파일 업로드 오류:", err);
                return res.status(500).json({ message: "파일 업로드 중 오류가 발생했습니다." });
            }

            // ✅ formidable v3 구조: files.image[0]
            const fileArray = files.image;
            const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

            if (!file) {
                return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
            }

            // ✅ 확장자 검사
            const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
            const ext = path.extname(file.originalFilename || "").toLowerCase();
            if (!allowedExtensions.includes(ext)) {
                if (fs.existsSync(file.filepath)) fs.unlinkSync(file.filepath);
                return res.status(400).json({ message: "jpg, jpeg, png, webp 파일만 허용됩니다." });
            }

            // ✅ 파일명 중복 방지
            const baseName = path.basename(file.originalFilename, ext);
            let savePath = path.join(uploadDir, `${baseName}${ext}`);
            let counter = 1;
            while (fs.existsSync(savePath)) {
                savePath = path.join(uploadDir, `${baseName}(${counter})${ext}`);
                counter++;
            }

            // ✅ 파일 이동
            fs.renameSync(file.filepath, savePath);

            const publicPath = `/images/PartnerImage/${path.basename(savePath)}`;

            return res.status(200).json({
                message: "업로드 성공",
                filePath: publicPath,
            });
        });
    } catch (err) {
        console.error("서버 오류:", err);
        return res.status(500).json({ message: "서버 내부 오류가 발생했습니다." });
    }
}
