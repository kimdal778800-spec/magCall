import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export default async function handler(req, res) {
    if (req.method !== "POST")
        return res.status(405).json({ message: "Method not allowed" });

    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: "이메일과 비밀번호를 입력하세요." });

    try {
        // ✅ DB 연결
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        // ✅ 사용자 조회
        const [rows] = await conn.execute("SELECT * FROM users WHERE email = ?", [email]);
        await conn.end();

        if (rows.length === 0)
            return res.status(401).json({ message: "존재하지 않는 이메일입니다." });

        const user = rows[0];

        // ✅ 비밀번호 검증
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });

        // ✅ JWT 발급
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        // ✅ 쿠키에 JWT 저장 (보안 모드)
        const cookie = serialize("token", token, {
            httpOnly: true, // 클라이언트에서 접근 불가
            secure: process.env.NODE_ENV === "production", // 배포 시 https 전용
            sameSite: "strict",
            maxAge: 2 * 60 * 60, // 2시간
            path: "/",
        });

        res.setHeader("Set-Cookie", cookie);

        // ✅ 응답 반환
        return res.status(200).json({
            message: "로그인 성공",
            user: { id: user.id, name: user.name, email: user.email },
        });
    } catch (error) {
        console.error("로그인 오류:", error);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
}
