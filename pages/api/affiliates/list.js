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
            CREATE TABLE IF NOT EXISTS affiliate_shops (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                url TEXT,
                image VARCHAR(500),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const [rows] = await conn.execute(
            "SELECT id, name, url, image FROM affiliate_shops ORDER BY id DESC"
        );
        await conn.end();

        return res.status(200).json({ affiliates: rows });
    } catch (err) {
        console.error("제휴 업소 목록 조회 오류:", err);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
}
