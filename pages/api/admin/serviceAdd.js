import mysql from "mysql2/promise";
import { requireAdmin } from "@/lib/adminAuth";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    if (!requireAdmin(req, res)) return;

    const { title, content } = req.body;
    if (!title) {
        return res.status(400).json({ message: "제목은 필수입니다." });
    }

    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        await conn.execute(`
            CREATE TABLE IF NOT EXISTS service_intro (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await conn.execute(
            "INSERT INTO service_intro (title, content) VALUES (?, ?)",
            [title, content || ""]
        );
        await conn.end();

        return res.status(200).json({ message: "등록 완료" });
    } catch (err) {
        console.error("서비스 소개 등록 오류:", err);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
}
