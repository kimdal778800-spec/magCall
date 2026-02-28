// ✅ /pages/api/admin/linksList.js
import mysql from "mysql2/promise";
import { requireAdmin } from "@/lib/adminAuth";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    if (!requireAdmin(req, res)) return;

    try {
        // ✅ DB 연결
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        // ✅ links 테이블 조회
        const [rows] = await conn.execute(
            "SELECT id, name, content, image, DATE_FORMAT(createdAt, '%Y-%m-%d') AS createdAt FROM links ORDER BY id DESC"
        );
        await conn.end();

        return res.status(200).json({ links: rows });
    } catch (error) {
        console.error("링크 목록 조회 오류:", error);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
}
