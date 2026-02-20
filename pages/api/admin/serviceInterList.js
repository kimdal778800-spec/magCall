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

        const [rows] = await conn.execute("SELECT * FROM serviceInter WHERE useYn = 'Y' ORDER BY id DESC");
        await conn.end();

        return res.status(200).json({ exchanges: rows });
    } catch (err) {
        console.error("DB 조회 오류:", err);
        return res.status(500).json({ message: "서버 오류 발생" });
    }
}
