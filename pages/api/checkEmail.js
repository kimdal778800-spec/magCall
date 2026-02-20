import mysql from "mysql2/promise";

export default async function handler(req, res) {
    if (req.method !== "POST")
        return res.status(405).json({ message: "Method not allowed" });

    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "이메일이 필요합니다." });

    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        const [rows] = await conn.execute(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );
        await conn.end();

        if (rows.length > 0) {
            // 이미 가입된 이메일
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (err) {
        console.error("checkEmail error:", err);
        return res.status(500).json({ message: "서버 오류" });
    }
}
