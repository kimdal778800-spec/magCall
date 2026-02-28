import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/adminAuth";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    if (!requireAdmin(req, res)) return;

    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "ID가 필요합니다." });

    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        // 삭제 전 이미지 경로 조회
        const [rows] = await conn.execute("SELECT image FROM massage_shops WHERE id = ?", [id]);

        await conn.execute("DELETE FROM massage_shops WHERE id = ?", [id]);
        await conn.end();

        // 서버 이미지 파일 삭제
        if (rows.length > 0 && rows[0].image) {
            const imagePath = rows[0].image; // e.g. /images/ShopImage/xxx.jpg
            const filePath = path.join(process.cwd(), "public", imagePath);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        return res.status(200).json({ message: "삭제 완료" });
    } catch (err) {
        console.error("업체 삭제 오류:", err);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
}
