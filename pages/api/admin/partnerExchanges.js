import mysql from "mysql2/promise";
import { requireAdmin } from "@/lib/adminAuth";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    if (!requireAdmin(req, res)) return;

    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ success: false, message: "ID가 필요합니다." });
        }

        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        const [rows] = await conn.execute(
            "SELECT * FROM partnerExchanges" +
            " WHERE id = ?",
            [id]
        );

        await conn.end();

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "거래소를 찾을 수 없습니다." });
        }

        return res.status(200).json({ success: true, exchange: rows[0] });
    } catch (err) {
        console.error("❌ DB 조회 오류:", err);
        return res.status(500).json({ success: false, message: "서버 오류" });
    }
}
