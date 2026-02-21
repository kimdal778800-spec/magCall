import mysql from "mysql2/promise";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { id } = req.query;

    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ message: "유효하지 않은 ID입니다." });
    }

    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        const [rows] = await conn.execute(
            "SELECT id, name, content, image, DATE_FORMAT(createdAt, '%Y-%m-%d') AS createdAt FROM links WHERE id = ?",
            [Number(id)]
        );
        await conn.end();

        if (rows.length === 0) {
            return res.status(404).json({ message: "슬라이드를 찾을 수 없습니다." });
        }

        return res.status(200).json({ slide: rows[0] });
    } catch (error) {
        console.error("슬라이드 조회 오류:", error);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
}
