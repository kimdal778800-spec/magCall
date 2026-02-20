import mysql from "mysql2";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {serialize} from "cookie";

// MySQL DB 연결
const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error("DB 연결 실패:", err);
    } else {
        console.log("DB 연결 성공");
    }
});

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { email, password } = req.body;

        // 이메일로 사용자 찾기
        db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
            if (err) {
                return res.status(500).json({ message: "서버 오류" });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
            }

            const user = results[0];

            // 비밀번호 비교
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    return res.status(500).json({ message: "비밀번호 확인 오류" });
                }

                if (!isMatch) {
                    return res.status(400).json({ message: "잘못된 비밀번호입니다." });
                }

                // level이 10 이상이면 관리자 로그인 가능
                if (user.level < 9) {
                    return res.status(403).json({ message: "관리자 권한이 없습니다." });
                }

                // 로그인 성공, JWT 토큰 생성
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

                // 로그인 성공 시 JWT 토큰 반환
                res.status(200).json({ id: user.id, level: user.level, token });
            });
        });
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
}
