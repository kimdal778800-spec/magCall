import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
    if (req.method !== "POST")
        return res.status(405).json({ message: "Method not allowed" });

    const { email, password, name, phone } = req.body;

    if (!email || !password || !name || !phone)
        return res.status(400).json({ message: "필수 항목이 누락되었습니다." });

    try {
        // DB 연결
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        // 중복 이메일 확인
        const [exists] = await connection.execute(
            "SELECT email FROM users WHERE email = ?",
            [email]
        );
        if (exists.length > 0) {
            await connection.end();
            return res.status(409).json({ message: "이미 가입된 이메일입니다." });
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // 새 유저 저장
        await connection.execute(
            "INSERT INTO users (email, password, name, phone ,created_at) VALUES (?, ?, ?, ?,NOW())",
            [email, hashedPassword, name, phone]
        );

        await connection.end();

        return res.status(200).json({ message: "회원가입 성공" });
    } catch (err) {
        console.error("회원가입 오류:", err);
        return res.status(500).json({ message: "서버 오류 발생" });
    }
}
