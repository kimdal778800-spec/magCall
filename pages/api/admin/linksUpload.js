import { formidable, IncomingForm } from "formidable";
import path from "path";
import fs from "fs";
import mysql from "mysql2/promise";
import { requireAdmin } from "@/lib/adminAuth";

export const config = {
    api: { bodyParser: false },
};

export default async function handler(req, res) {

    if (req.method !== "POST")
        return res.status(405).json({ message: "Method not allowed" });

    if (!requireAdmin(req, res)) return;

    try {
        // ✅ 업로드 폴더 보장
        const uploadDir = path.join(process.cwd(), "public/images");
        if (!fs.existsSync(uploadDir))
            fs.mkdirSync(uploadDir, { recursive: true });

        // ✅ form 객체를 new IncomingForm() 으로 생성
        const form = new IncomingForm({
            multiples: false,
            uploadDir,
            keepExtensions: true,
        });
        // ✅ Promise 기반으로 파싱
        const { fields, files } = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve({ fields, files });
            });
        });
        const { name, content } = fields;
        const img = Array.isArray(files.image) ? files.image[0] : files.image;
        if (!img) return res.status(400).json({ message: "이미지 파일이 없습니다." });

        const nameValue = Array.isArray(name) ? name[0] : name;
        const contentValue = Array.isArray(content) ? content[0] : (content || "");

        const fileName = path.basename(img.filepath);
        const imagePath = `/images/${fileName}`;

        // ✅ DB 저장
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        await conn.execute(
            "INSERT INTO links (name, content, image) VALUES (?, ?, ?)",
            [nameValue, contentValue, imagePath]
        );
        await conn.end();

        return res.status(200).json({
            message: "업로드 및 DB 저장 성공",
            link: { name, content: contentValue, image: imagePath },
        });
    } catch (err) {
        console.error("업로드 처리 중 오류:", err);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
}
