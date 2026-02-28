import mysql from "mysql2/promise";
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

        await conn.execute("DELETE FROM service_intro WHERE id = ?", [id]);
        await conn.end();

        return res.status(200).json({ message: "삭제 완료" });
    } catch (err) {
        console.error("서비스 소개 삭제 오류:", err);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
}
