import mysql from "mysql2/promise";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/adminAuth";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    if (!requireAdmin(req, res)) return;

    const uploadDir = path.join(process.cwd(), "public", "images", "AffiliateImage");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const form = formidable({ multiples: false, keepExtensions: true, uploadDir, maxFileSize: 10 * 1024 * 1024 });

    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(500).json({ message: "파일 업로드 실패" });

        const get = (f) => (Array.isArray(fields[f]) ? fields[f][0] : fields[f]) || "";
        const name = get("name");
        const url = get("url");
        const description = get("description");

        if (!name) {
            return res.status(400).json({ message: "사이트명은 필수입니다." });
        }

        const file = Array.isArray(files.image) ? files.image[0] : files.image;
        if (file) {
            const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
            const ext = path.extname(file.originalFilename || "").toLowerCase();
            if (!allowedExtensions.includes(ext)) {
                if (fs.existsSync(file.filepath)) fs.unlinkSync(file.filepath);
                return res.status(400).json({ message: "jpg, jpeg, png, webp 파일만 허용됩니다." });
            }
        }

        const imagePath = file ? `/images/AffiliateImage/${path.basename(file.filepath)}` : "";

        try {
            const conn = await mysql.createConnection({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_NAME,
            });

            await conn.execute(`
                CREATE TABLE IF NOT EXISTS affiliate_shops (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    url TEXT,
                    image VARCHAR(500),
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await conn.execute(
                "INSERT INTO affiliate_shops (name, url, image, description) VALUES (?, ?, ?, ?)",
                [name, url, imagePath, description]
            );
            await conn.end();

            return res.status(200).json({ message: "등록 완료" });
        } catch (error) {
            console.error("제휴 업소 등록 오류:", error);
            return res.status(500).json({ message: "서버 오류가 발생했습니다." });
        }
    });
}
