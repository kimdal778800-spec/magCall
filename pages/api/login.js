import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export default async function handler(req, res) {
    if (req.method !== "POST")
        return res.status(405).json({ message: "Method not allowed" });

    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: "아이디와 비밀번호를 입력하세요." });

    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        const [rows] = await conn.execute("SELECT * FROM users WHERE username = ?", [username]);
        await conn.end();

        if (rows.length === 0)
            return res.status(401).json({ message: "존재하지 않는 아이디입니다." });

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });

        // ✅ JWT 발급
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, level: user.level },
            process.env.JWT_SECRET,
            { expiresIn: "2h" } // 2시간 유지
        );

        // ✅ 쿠키 설정
        const cookie = serialize("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 2 * 60 * 60, // 2시간
        });

        res.setHeader("Set-Cookie", cookie);
        return res.status(200).json({
            message: "로그인 성공",
            user: { id: user.id, name: user.name, email: user.email, level: user.level },
        });
    } catch (error) {
        console.error("로그인 오류:", error);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
}
