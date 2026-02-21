import mysql from "mysql2/promise";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
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

        const [rows] = await conn.execute(
            "SELECT id, title, content FROM service_intro ORDER BY id DESC"
        );
        await conn.end();

        return res.status(200).json({ items: rows });
    } catch (err) {
        console.error("서비스 소개 조회 오류:", err);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
}
