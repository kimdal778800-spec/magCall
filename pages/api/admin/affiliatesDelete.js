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

        const [rows] = await conn.execute("SELECT image FROM affiliate_shops WHERE id = ?", [id]);
        await conn.execute("DELETE FROM affiliate_shops WHERE id = ?", [id]);
        await conn.end();

        if (rows.length > 0 && rows[0].image) {
            const filePath = path.join(process.cwd(), "public", rows[0].image);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        return res.status(200).json({ message: "삭제 완료" });
    } catch (err) {
        console.error("제휴 업소 삭제 오류:", err);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
}
