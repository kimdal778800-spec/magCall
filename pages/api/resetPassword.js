import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
    if (req.method !== "POST")
        return res.status(405).json({ message: "Method Not Allowed" });

    const { email, newPassword } = req.body;

    try {
        const hashed = await bcrypt.hash(newPassword, 10);
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        await conn.execute("UPDATE users SET password = ? WHERE email = ?", [
            hashed,
            email,
        ]);
        await conn.end();

        return res.status(200).json({ message: "비밀번호가 성공적으로 변경되었습니다." });
    } catch (error) {
        console.error("비밀번호 변경 오류:", error);
        return res.status(500).json({ message: "서버 오류" });
    }
}
