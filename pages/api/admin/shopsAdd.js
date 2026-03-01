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

    const uploadDir = path.join(process.cwd(), "public", "images", "ShopImage");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const form = formidable({ multiples: false, keepExtensions: true, uploadDir, maxFileSize: 10 * 1024 * 1024 });

    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(500).json({ message: "파일 업로드 실패" });

        const get = (f) => (Array.isArray(fields[f]) ? fields[f][0] : fields[f]) || "";
        const name = get("name");
        const category = get("category");
        const theme_type = get("theme_type");
        const region = get("region");
        const sub_region = get("sub_region");
        const phone = get("phone");
        const telegram = get("telegram");
        const description = get("description");
        const is_special = get("is_special") === "true" ? 1 : 0;

        if (!name || !category) {
            return res.status(400).json({ message: "업체명과 카테고리는 필수입니다." });
        }

        const file = Array.isArray(files.image) ? files.image[0] : files.image;
        if (file) {
            const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
            const ext = path.extname(file.originalFilename || "").toLowerCase();
            if (!allowedExtensions.includes(ext)) {
                if (fs.existsSync(file.filepath)) fs.unlinkSync(file.filepath);
                return res.status(400).json({ message: "jpg, jpeg, png, webp 파일만 허용됩니다." });
            }
            fs.chmodSync(file.filepath, 0o644);
        }

        const imagePath = file ? `/images/ShopImage/${path.basename(file.filepath)}` : "";

        try {
            const conn = await mysql.createConnection({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_NAME,
            });

            // theme_type 컬럼이 없으면 자동 추가 (MySQL 5.x 호환)
            const [cols] = await conn.execute(
                "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'massage_shops' AND COLUMN_NAME = 'theme_type'"
            );
            if (cols[0].cnt === 0) {
                await conn.execute("ALTER TABLE massage_shops ADD COLUMN theme_type VARCHAR(50) DEFAULT NULL");
            }

            // telegram 컬럼이 없으면 자동 추가
            const [telegramCols] = await conn.execute(
                "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'massage_shops' AND COLUMN_NAME = 'telegram'"
            );
            if (telegramCols[0].cnt === 0) {
                await conn.execute("ALTER TABLE massage_shops ADD COLUMN telegram VARCHAR(100) DEFAULT NULL");
            }

            // is_special 컬럼이 없으면 자동 추가
            const [specialCols] = await conn.execute(
                "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'massage_shops' AND COLUMN_NAME = 'is_special'"
            );
            if (specialCols[0].cnt === 0) {
                await conn.execute("ALTER TABLE massage_shops ADD COLUMN is_special TINYINT(1) DEFAULT 0");
            }

            await conn.execute(
                "INSERT INTO massage_shops (name, image, category, theme_type, region, sub_region, phone, telegram, description, is_special) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [name, imagePath, category, theme_type, region, sub_region, phone, telegram, description, is_special]
            );
            await conn.end();

            return res.status(200).json({ message: "등록 완료" });
        } catch (error) {
            console.error("업체 등록 오류:", error);
            return res.status(500).json({ message: "서버 오류가 발생했습니다." });
        }
    });
}
