import mysql from "mysql2/promise";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const { name, logo, rate, discount, fee1, fee2, tag, description } = req.body;

        if (!name || !logo) {
            return res.status(400).json({ message: "거래소명과 로고는 필수 항목입니다." });
        }

        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        const sql = `
      INSERT INTO partnerExchanges (name, logo, rate, discount, fee1, fee2, tag, description)
      VALUES (?, ?, ?, ?, ?, ?, ?,?)
    `;
        await conn.execute(sql, [name, logo, rate, discount, fee1, fee2, tag,description]);
        await conn.end();

        return res.status(200).json({ message: "거래소가 성공적으로 등록되었습니다!" });
    } catch (err) {
        console.error("❌ DB 오류:", err);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
}
