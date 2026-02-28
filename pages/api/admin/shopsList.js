import mysql from "mysql2/promise";
import { requireAdmin } from "@/lib/adminAuth";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    if (!requireAdmin(req, res)) return;

    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        const [rows] = await conn.execute(
            "SELECT id, name, image, category, region, sub_region, phone, is_active, DATE_FORMAT(createdAt, '%Y-%m-%d') AS createdAt FROM massage_shops ORDER BY id DESC"
        );
        await conn.end();

        return res.status(200).json({ shops: rows });
    } catch (err) {
        console.error("업체 목록 조회 오류:", err);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
}
