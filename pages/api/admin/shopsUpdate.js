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
        const id = get("id");
        const name = get("name");
        const category = get("category");
        const theme_type = get("theme_type");
        const region = get("region");
        const sub_region = get("sub_region");
        const phone = get("phone");
        const telegram = get("telegram");
        const description = get("description");
        const delete_image = get("delete_image");
        const is_special = get("is_special") === "true" ? 1 : 0;

        if (!id || !name || !category) {
            return res.status(400).json({ message: "필수 항목이 누락되었습니다." });
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

        try {
            const conn = await mysql.createConnection({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_NAME,
            });

            // is_special 컬럼이 없으면 자동 추가
            const [specialCols] = await conn.execute(
                "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'massage_shops' AND COLUMN_NAME = 'is_special'"
            );
            if (specialCols[0].cnt === 0) {
                await conn.execute("ALTER TABLE massage_shops ADD COLUMN is_special TINYINT(1) DEFAULT 0");
            }

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

            if (file) {
                // 기존 이미지 경로 조회 후 파일 삭제
                const [rows] = await conn.execute("SELECT image FROM massage_shops WHERE id = ?", [id]);
                if (rows.length > 0 && rows[0].image) {
                    const oldFilePath = path.join(process.cwd(), "public", rows[0].image);
                    if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
                }

                // 새 이미지로 업데이트
                const imagePath = `/images/ShopImage/${path.basename(file.filepath)}`;
                await conn.execute(
                    "UPDATE massage_shops SET name=?, category=?, theme_type=?, region=?, sub_region=?, phone=?, telegram=?, description=?, image=?, is_special=? WHERE id=?",
                    [name, category, theme_type, region, sub_region, phone, telegram, description, imagePath, is_special, id]
                );
            } else if (delete_image === "true") {
                // 이미지 삭제 요청
                const [rows] = await conn.execute("SELECT image FROM massage_shops WHERE id = ?", [id]);
                if (rows.length > 0 && rows[0].image) {
                    const oldFilePath = path.join(process.cwd(), "public", rows[0].image);
                    if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
                }
                await conn.execute(
                    "UPDATE massage_shops SET name=?, category=?, theme_type=?, region=?, sub_region=?, phone=?, telegram=?, description=?, image=NULL, is_special=? WHERE id=?",
                    [name, category, theme_type, region, sub_region, phone, telegram, description, is_special, id]
                );
            } else {
                // 이미지 변경 없는 경우
                await conn.execute(
                    "UPDATE massage_shops SET name=?, category=?, theme_type=?, region=?, sub_region=?, phone=?, telegram=?, description=?, is_special=? WHERE id=?",
                    [name, category, theme_type, region, sub_region, phone, telegram, description, is_special, id]
                );
            }

            await conn.end();
            return res.status(200).json({ message: "수정 완료" });
        } catch (error) {
            console.error("업체 수정 오류:", error);
            return res.status(500).json({ message: "서버 오류가 발생했습니다." });
        }
    });
}
